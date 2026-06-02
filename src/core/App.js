// src/core/App.js
import { StateManager } from './StateManager.js';
import { ParticleSystem } from '../effects/ParticleSystem.js';
import { Loader } from '../components/Loader.js';
import { Hero } from '../components/Hero.js';
import { ControlPanel } from '../components/ControlPanel.js';
import { Playground } from '../components/Playground.js';

class App {
    constructor() {
        this.stateManager = new StateManager();
        this.canvas = document.getElementById('effects-canvas');
        
        // 🔥 新增：背景粒子生成計數器（用來精準控制高幀率下的發射頻率）
        this.ambientCounter = 0;

        this.init();
    }

    init() {
        console.log("%c🚀 視覺特效動畫平台核心引擎初始化中...", "color: #7cfcff; font-weight: bold;");

        if (this.canvas) {
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100vh';
            this.canvas.style.pointerEvents = 'none'; 
            this.canvas.style.zIndex = '9999';        
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }

        this.particleSystem = new ParticleSystem(this.canvas);
        this.hero = new Hero();
        
        this.loader = new Loader(() => {
            this.controlPanel = new ControlPanel(this.stateManager);
            this.playground = new Playground(this.stateManager, this.particleSystem);
        });

        // 啟動每秒 60 幀的高效能引擎
        this.tick();
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }

    // 🔥 核心重構：改用幀同步（Frame-based）來生成背景粒子，數量變多且完全不卡！
    // src/core/App.js 的 spawnAmbientParticlesFrame 函數

    spawnAmbientParticlesFrame() {
        this.ambientCounter++;
        const state = this.stateManager.getState();

        // 預設模式（每 20 幀落下一顆星光）
        if (state.currentMode === 'normal' && this.ambientCounter % 20 === 0) {
            const randomX = Math.random() * window.innerWidth;
            this.particleSystem.emit(randomX, -20, 'ambient', 1);
        }

        // 🔥 燃燒模式（每 8 幀生成一個，降低頻率但調大粒子體積，畫面依舊震撼明顯）
        if (state.currentMode === 'fire' && this.ambientCounter % 8 === 0) {
            const randomX = Math.random() * window.innerWidth;
            const randomY = window.innerHeight - 15;
            this.particleSystem.emit(randomX, randomY, 'fire', 1);
        }

        // 🫧 泡泡模式（每 10 幀生成一個，背景滿滿的夢幻大泡泡）
        if (state.currentMode === 'bubble' && this.ambientCounter % 10 === 0) {
            const randomX = Math.random() * window.innerWidth;
            const randomY = window.innerHeight + 20;
            this.particleSystem.emit(randomX, randomY, 'bubble', 1);
        }
    }

    tick() {
        // 1. 每幀執行背景粒子發射判定
        this.spawnAmbientParticlesFrame();

        // 2. 更新與渲染粒子系統
        this.particleSystem.update();
        this.particleSystem.render();

        // 3. 循環下一幀
        requestAnimationFrame(() => this.tick());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.FX_PLATFORM = new App();
});