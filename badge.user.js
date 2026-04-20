// ==UserScript==
// @name         2libra 徽章系统 Pro版（接口修复）
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  在2libra网站侧边显示已获得的徽章，并提示新解锁的徽章
// @author       YourName
// @match        https://2libra.com/*
// @grant        none
// @language     en
// @license MIT
// @downloadURL https://update.greasyfork.org/scripts/574693/2libra%20%E5%BE%BD%E7%AB%A0%E7%B3%BB%E7%BB%9F%20Pro%E7%89%88%EF%BC%88%E6%8E%A5%E5%8F%A3%E4%BF%AE%E5%A4%8D%EF%BC%89.user.js
// @updateURL https://update.greasyfork.org/scripts/574693/2libra%20%E5%BE%BD%E7%AB%A0%E7%B3%BB%E7%BB%9F%20Pro%E7%89%88%EF%BC%88%E6%8E%A5%E5%8F%A3%E4%BF%AE%E5%A4%8D%EF%BC%89.meta.js
// ==/UserScript==

(function () {
    'use strict';

    setTimeout(init, 1500);

    async function init() {
        const owned = await fetchOwned();
        render(owned);
        toastNew(owned);
    }

    async function fetchOwned() {
        const res = await fetch('/api/badges/my');
        const json = await res.json();

        return (json.d || []).map(i => ({
            name: i.badge.name,
            desc: i.badge.acquisition_condition,
            icon: i.badge.icon_url,
            rate: i.badge.user_percentage
        }));
    }

    function rarityColor(rate) {
        if (rate < 5) return '#e53935';
        if (rate < 20) return '#fb8c00';
        return '#43a047';
    }

    function render(list) {
        const panel = document.createElement('div');

        panel.innerHTML = `
        <div style="
            position:fixed;right:20px;top:80px;width:280px;
            background:#fff;border-radius:12px;
            box-shadow:0 6px 20px rgba(0,0,0,.15);
            padding:10px;z-index:2147483647;
        ">
            <b>🎯 成就系统 (${list.length})</b>

            ${list.map(b => `
                <div style="
                    display:flex;
                    align-items:center;
                    margin-top:8px;
                    padding:6px;
                    border-radius:6px;
                    background:#fafafa;
                ">
                    <img src="${b.icon}" width="30" style="margin-right:8px"/>
                    <div style="flex:1">
                        <div>${b.name}</div>
                        <div style="font-size:11px;color:#888">${b.desc}</div>
                    </div>
                    <div style="
                        font-size:11px;
                        color:${rarityColor(b.rate)}
                    ">
                        ${b.rate.toFixed(1)}%
                    </div>
                </div>
            `).join('')}
        </div>
        `;

        document.body.appendChild(panel);
    }

    function toastNew(list) {
        const prev = JSON.parse(localStorage.getItem('prev_badges') || '[]');

        list.forEach(b => {
            if (!prev.includes(b.name)) {
                showToast(b.name);
            }
        });

        localStorage.setItem('prev_badges', JSON.stringify(list.map(b => b.name)));
    }

    function showToast(name) {
        const div = document.createElement('div');
        div.innerText = `🏆 解锁：${name}`;

        div.style = `
            position:fixed;
            bottom:20px;
            left:20px;
            background:#1b2838;
            color:#fff;
            padding:10px;
            border-radius:6px;
            z-index:2147483647;
        `;

        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

})();