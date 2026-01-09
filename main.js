// main.js - 깔끔한 SQLite 버전
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// 개발 모드 감지 (더 명확하게)
const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

console.log('=== Electron 시작 ===');
console.log('isDev:', isDev);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('isPackaged:', app.isPackaged);

// 1. DB 파일 열기 (없으면 store.db 파일을 자동으로 생성함)
// 폴더에 store.db 파일이 생기는지 확인해보세요!
let db;
try {
  const Database = require('better-sqlite3');
  db = new Database('store.db', { verbose: console.log });
} catch (err) {
  console.error('SQLite 초기화 실패:', err);
  console.error('better-sqlite3를 재빌드해야 할 수 있습니다: npm run electron-rebuild');
}

// 2. 테이블 만들기 (상품 목록 저장용)
if (db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL
    )
  `);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 개발 모드와 프로덕션 모드 구분
  if (isDev) {
    // 개발 모드: webpack-dev-server 사용
    console.log('개발 모드: http://localhost:1205 로드 시도');
    win.loadURL('http://localhost:1205').catch(err => {
      console.error('URL 로드 실패:', err);
      win.loadFile(path.join(__dirname, 'dist', 'index.html')).catch(err2 => {
        console.error('파일 로드도 실패:', err2);
      });
    });
    // 개발자 도구 자동 열기
    win.webContents.openDevTools();
  } else {
    // 프로덕션 모드: 빌드된 파일 로드
    const distPath = path.join(__dirname, 'dist', 'index.html');
    console.log('프로덕션 모드: 파일 로드 시도', distPath);
    if (fs.existsSync(distPath)) {
      win.loadFile(distPath).catch(err => {
        console.error('파일 로드 실패:', err);
      });
    } else {
      console.error('dist/index.html 파일이 없습니다. 먼저 빌드하세요: npm run build:win');
      win.loadURL('http://localhost:1205').catch(err => {
        console.error('URL 로드도 실패:', err);
      });
    }
  }
  
  // 에러 이벤트 리스너
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('페이지 로드 실패:', errorCode, errorDescription);
  });
}

app.whenReady().then(() => {
  createWindow();

  // ★ 통신 기능 (React가 요청하면 처리)

  // 1. 상품 추가하기 (INSERT)
  ipcMain.handle('add-product', (event, item) => {
    if (!db) {
      return { success: false, error: '데이터베이스가 초기화되지 않았습니다.' };
    }
    try {
      const stmt = db.prepare('INSERT INTO products (name, price) VALUES (?, ?)');
      const info = stmt.run(item.name, item.price);
      return { success: true, id: info.lastInsertRowid }; // 성공하면 ID를 돌려줌
    } catch (err) {
      console.error('상품 추가 실패:', err);
      return { success: false, error: err.message };
    }
  });

  // 2. 상품 목록 가져오기 (SELECT)
  ipcMain.handle('get-products', () => {
    if (!db) {
      return [];
    }
    try {
      const stmt = db.prepare('SELECT * FROM products ORDER BY id DESC');
      return stmt.all(); // 배열 형태로 돌려줌
    } catch (err) {
      console.error('상품 목록 가져오기 실패:', err);
      return [];
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});