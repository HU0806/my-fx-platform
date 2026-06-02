export class Playground {
    constructor(stateManager, particleSystem) {
        this.stateManager = stateManager;
        this.particleSystem = particleSystem;

        this.catContainer = document.getElementById('main-cat');
        this.catImg = document.getElementById('main-cat-img');
        this.btnAudio = document.getElementById('btn-audio');
        this.btnUpload = document.getElementById('btn-upload');
        this.btnReset = document.getElementById('btn-reset'); 
        this.imageUploader = document.getElementById('image-uploader');
        
        this.statClicks = document.getElementById('stat-clicks');
        this.statMode = document.getElementById('stat-mode');

        this.meowAudio = new Audio('assets/audio/meow.mp3');
        this.meowAudio.volume = 0.7;

        // 💡 核心新增：初始動畫狀態鎖，預設為沒有在跳動
        this.isJumping = false;

        this.init();
    }

    init() {
        if (!this.catContainer || !this.catImg) return;

        // 偵測目前是否為移動端/手機（透過觸控支援度與螢幕寬度判斷）
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768;

        // === 1. 3D 傾斜效果（僅在桌機版啟用，防止手機滑動網頁時衝突卡頓） ===
        if (!isMobile) {
            this.catContainer.addEventListener('mousemove', (e) => {
                const rect = this.catContainer.getBoundingClientRect();
                const deltaX = (e.clientX - (rect.left + rect.width / 2)) / rect.width * 30;
                const deltaY = (e.clientY - (rect.top + rect.height / 2)) / rect.height * 30;
                
                if (!this.isJumping) {
                    this.catImg.style.transition = 'transform 0.1s ease-out';
                    this.catImg.style.transform = `perspective(1000px) rotateX(${-deltaY}deg) rotateY(${deltaX}deg) scale(1.05)`;
                }

                const state = this.stateManager.getState();
                if (state.currentMode === 'normal' && Math.random() > 0.85) {
                    this.particleSystem.emit(e.clientX, e.clientY, 'heart', 1);
                }
            });

            this.catContainer.addEventListener('mouseleave', () => {
                if (!this.isJumping) {
                    this.catImg.style.transition = 'transform 0.5s ease-out';
                    this.catImg.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
                }
            });
        }

        // === 2. 點擊/觸控互動事件綁定（核心手機相容修正） ===
        
        // 桌機端點擊事件
        this.catContainer.addEventListener('click', (e) => {
            // 如果是支援觸控的手機，由 touchstart 處理，click 就不重複執行，防止點一下噴兩次
            if ('ontouchstart' in window) return; 
            this.handleInteract(e.clientX, e.clientY);
        });

        // 💡 新增：手機端觸控事件支援
        this.catContainer.addEventListener('touchstart', (e) => {
            // 阻止觸控引起的預設縮放或奇怪行為
            // e.preventDefault(); // 如果會影響按鈕點擊，此行可不開
            
            // 獲取手指觸碰的第一個點的座標
            if (e.touches && e.touches[0]) {
                const touch = e.touches[0];
                this.handleInteract(touch.clientX, touch.clientY);
            }
        });


        // === 3. 其餘控制按鈕事件（保持不變，手機瀏覽器原生相容 click） ===
        if (this.btnAudio) this.btnAudio.addEventListener('click', () => this.playAudio());

        if (this.btnUpload && this.imageUploader) {
            this.btnUpload.addEventListener('click', () => this.imageUploader.click());
            this.imageUploader.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.stateManager.setState({ currentImage: event.target.result, isUserUploaded: true });
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        if (this.btnReset) {
            this.btnReset.addEventListener('click', () => {
                const state = this.stateManager.getState();
                let defaultImg = '8b374a4f-90c3-46eb-843d-6b4aa15c9706.jpg'; 
                if (state.currentMode === 'normal') defaultImg = '8b374a4f-90c3-46eb-843d-6b4aa15c9706.jpg';
                if (state.currentMode === 'bubble') defaultImg = 'b7a58574-3b39-43f5-9a6d-8e7d9d1aabf4.jpg';
                if (state.currentMode === 'fire') defaultImg = '0897732c-b2e7-468c-b232-c6d9ccdd7462.jpg';
                this.stateManager.setState({ currentImage: defaultImg, isUserUploaded: false });
                this.imageUploader.value = '';
            });
        }

        this.stateManager.subscribe((state) => this.updateUI(state));
        this.updateUI(this.stateManager.getState());
    }

    // 💡 核心優化：控制完整執行完一次才能點擊的邏輯
    handleInteract(x, y) {
        if (this.isJumping) return;
        this.isJumping = true;

        const state = this.stateManager.getState();
        const newClicks = state.stats.totalClicks + 1;
        this.stateManager.updateStats('totalClicks', newClicks);

        // 圖片跳動動畫
        this.catImg.style.transition = 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        this.catImg.style.transform = 'scale(1.22) rotate(12deg)';

        // 💡 嚴格分流：確保模式粒子絕不混雜，數量控制在最流暢的完美平衡點
        if (state.currentMode === 'normal') {
            this.particleSystem.emit(x, y, 'paw', 5);
            this.particleSystem.emit(x, y, 'heart', 4);
        } else if (state.currentMode === 'bubble') {
            // 泡泡模式「只」發射 6 個點擊泡泡
            this.particleSystem.emit(x, y, 'bubble', 6);
        } else if (state.currentMode === 'fire') {
            // 燃燒模式「只」發射 6 個點擊火焰
            this.particleSystem.emit(x, y, 'fire', 6);
        }

        setTimeout(() => {
            this.catImg.style.transition = 'transform 0.4s ease';
            this.catImg.style.transform = 'scale(1) rotate(0deg)';
            setTimeout(() => {
                this.isJumping = false;
            }, 100);
        }, 300);
    }

    playAudio() {
        this.meowAudio.currentTime = 0;
        this.meowAudio.play().catch(err => console.log("音效播映受限:", err));
    }

    updateUI(state) {
        if (this.catImg.src !== state.currentImage) {
            this.catImg.src = state.currentImage;
        }
        if (this.statClicks) this.statClicks.textContent = state.stats.totalClicks;
        if (state.currentMode === 'fire') {
            if (this.statMode) this.statMode.textContent = "🔥 燃燒模式";
            this.catImg.style.filter = 'hue-rotate(340deg) brightness(1.3) saturate(1.8)';
        } else if (state.currentMode === 'bubble') {
            if (this.statMode) this.statMode.textContent = "🫧 泡泡模式";
            this.catImg.style.filter = 'hue-rotate(180deg) brightness(1.1)';
        } else {
            if (this.statMode) this.statMode.textContent = "✨ 預設";
            this.catImg.style.filter = 'none';
        }
    }
}