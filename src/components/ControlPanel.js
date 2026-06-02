export class ControlPanel {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.container = document.getElementById('experiments-grid');
        this.init();
    }

    init() {
        if (!this.container) return;

        // 💡 修改名稱與介紹，讓文案風格完全統一
        const experiments = [
            {
                id: 'normal',
                title: "預設", // 🔓 跟隨改成預設
                img: "8b374a4f-90c3-46eb-843d-6b4aa15c9706.jpg",
                desc: "滑鼠跟隨 + 觸摸粒子與愛心"
            },
            {
                id: 'bubble',
                title: "泡泡模式", // 🔓 名字統一改成泡泡模式
                img: "b7a58574-3b39-43f5-9a6d-8e7d9d1aabf4.jpg",
                desc: "開啟泡泡粒子特效" // 🔓 介紹改得跟燃燒模式一樣
            },
            {
                id: 'fire',
                title: "燃燒模式",
                img: "0897732c-b2e7-468c-b232-c6d9ccdd7462.jpg",
                desc: "開啟火焰粒子特效"
            }
        ];

        this.container.innerHTML = '';

        experiments.forEach(exp => {
            const card = document.createElement('div');
            card.className = 'experiment-card glass';
            card.innerHTML = `
                <img src="${exp.img}" alt="${exp.title}">
                <div class="info">
                    <h4>${exp.title}</h4>
                    <p>${exp.desc}</p>
                </div>
            `;

            card.addEventListener('click', () => {
                this.stateManager.setState({ currentMode: exp.id });
                
                const state = this.stateManager.getState();
                if (!state.isUserUploaded) {
                    if (exp.id === 'normal') this.stateManager.setState({ currentImage: '8b374a4f-90c3-46eb-843d-6b4aa15c9706.jpg' });
                    if (exp.id === 'bubble') this.stateManager.setState({ currentImage: 'b7a58574-3b39-43f5-9a6d-8e7d9d1aabf4.jpg' });
                    if (exp.id === 'fire') this.stateManager.setState({ currentImage: '0897732c-b2e7-468c-b232-c6d9ccdd7462.jpg' });
                }
            });

            this.container.appendChild(card);
        });
    }
}