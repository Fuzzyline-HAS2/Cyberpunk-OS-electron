// main.js - 깔끔한 SQLite 버전
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');

// 1. DB 파일 열기 (없으면 store.db 파일을 자동으로 생성함)
// 폴더에 store.db 파일이 생기는지 확인해보세요!
const db = new Database('store.db', { verbose: console.log });

// 2. 테이블 만들기 (상품 목록 저장용)
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price INTEGER NOT NULL
  )
`);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 포트 번호 1205 확인
  win.loadURL('http://localhost:1205');
}

app.whenReady().then(() => {
  createWindow();

  // ★ 통신 기능 (React가 요청하면 처리)

  // 1. 상품 추가하기 (INSERT)
  ipcMain.handle('add-product', (event, item) => {
    try {
      const stmt = db.prepare('INSERT INTO products (name, price) VALUES (?, ?)');
      const info = stmt.run(item.name, item.price);
      return { success: true, id: info.lastInsertRowid }; // 성공하면 ID를 돌려줌
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // 2. 상품 목록 가져오기 (SELECT)
  ipcMain.handle('get-products', () => {
    try {
      const stmt = db.prepare('SELECT * FROM products ORDER BY id DESC');
      return stmt.all(); // 배열 형태로 돌려줌
    } catch (err) {
      return [];
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});