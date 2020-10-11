import storage from '../../services/Storage.js'

let Navbar = {
    render: async () => {
        return `
             <nav class="navbar" role="navigation" aria-label="main navigation">
                <div class="container">
                    <div class="navbar-menu is-active" aria-expanded="false">
                        <div class="navbar-start">
                            <a class="navbar-item" href="/#/">
                                Выбрать машину
                            </a>
                            ${storage.car === null ? '' : `
                                <a class="navbar-item" href="/#/car">
                                    Информация о машине
                                </a>
                                <a class="navbar-item" href="/#/calculator">
                                    Кредитный калькулятор
                                </a>
                                <a class="navbar-item" href="/#/loan">
                                    Заявка на кредит
                                </a>`
                            }
                        </div>
                    </div>
                </div>
            </nav>
        `;
    },

    after_render: async () => { }
};

export default Navbar;