<header>
    <a href="/app/" class="logo">
        <img src="/images/logo.svg" alt="logo">
        <p><span>PAX</span> System obsługi paczek</p>
    </a> 
    <nav>
        <div class="menu">
            <ul>
                <li><a href="/app/">Strona główna</a></li>
                {% if not loggedin %}
                <li><a href="/app/registration">Rejestracja</a></li>
                {% endif %}
                {% if loggedin %}
                <li><a href="/app/send">Nadaj paczkę</a></li>
                <li><a href="/app/waybills_list">Lista wysłanych paczek</a></li>
                {% endif %}
            </ul>
        </div>
    </nav>
    {% if not loggedin %}
    <a href="/app/login">
        <img src="/images/konto.svg" alt="moje konto"> 
    </a>
    {% endif %}
    {% if loggedin %}
    <a href="/app/waybills_list">
        <img src="/images/konto.svg" alt="moje konto"> 
    </a>
    {% endif %}
</header>