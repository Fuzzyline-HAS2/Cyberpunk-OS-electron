import React, { useState } from "react";
import { Link } from "react-router-dom";

// Electron 연결
const electron = window.require ? window.require('electron') : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

const Home = () => {
    const [status, setStatus] = useState('대기 중...');

    // ★ 테스트 1: 상품 추가하기
    const handleAddProduct = async () => {
        if (!ipcRenderer) return alert("Electron이 아닙니다!");

        // 1. DB에 저장 요청
        const result = await ipcRenderer.invoke('add-product', { 
            name: '아이스 아메리카노', 
            price: 4500 
        });

        if (result.success) {
            setStatus(`✅ 저장 성공! (ID: ${result.id})`);
            alert("DB 파일에 저장되었습니다!");
        } else {
            setStatus("❌ 저장 실패");
        }
    };

    // ★ 테스트 2: 저장된 목록 불러오기
    const handleGetList = async () => {
        if (!ipcRenderer) return;
        
        const list = await ipcRenderer.invoke('get-products');
        console.log("불러온 목록:", list);
        setStatus(`📂 총 ${list.length}개의 상품을 불러왔습니다. (콘솔 확인)`);
    };

    return (
        <div>
            <h1>홈</h1>
            <p>하이드앤시크 매장 관리 시스템</p>

            {/* ▼▼▼ SQLite 테스트 버튼 ▼▼▼ */}
            <div style={{ border: '2px solid blue', padding: '15px', margin: '20px 0' }}>
                <h3>📂 로컬 DB(SQLite) 테스트</h3>
                <p>상태: <strong>{status}</strong></p>
                
                <button onClick={handleAddProduct} style={{ marginRight: '10px', padding: '10px' }}>
                    ☕ 상품 추가 테스트
                </button>
                
                <button onClick={handleGetList} style={{ padding: '10px' }}>
                    📋 목록 불러오기 (콘솔)
                </button>
            </div>
            {/* ▲▲▲ 테스트 끝 ▲▲▲ */}

            <Link to='/iotglove'>iotglove</Link>
            <br />
            <Link to='/cyberpunk'>사이버펑크</Link>
        </div>
    );
};

export default Home;