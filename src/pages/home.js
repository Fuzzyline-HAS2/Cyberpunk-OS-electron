import React, { useState } from "react";
import { Link } from "react-router-dom";

// Electron 연결
const electron = window.require ? window.require('electron') : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

const Home = () => {
    return (
        <div>
            <h1>홈</h1>
            <p>하이드앤시크 매장 관리 시스템</p>


            <Link to='/iotglove'>iotglove</Link>
            <br />
            <Link to='/cyberpunk'>사이버펑크</Link>
        </div>
    );
};

export default Home;