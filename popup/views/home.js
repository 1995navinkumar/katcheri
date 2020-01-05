
var html = require('choo/html')
var comp = require('../components/comp');

module.exports = function(state, emitter) {
  let route = state.route.split('/');
  return html`
  <body>
    <div class="header">
      <h2>Peer Party !!</h2>
      <!-- <img hide id="home-icon" src="assets/img/home-icon.png" alt=""> -->
      <img id="settings-icon" src="assets/img/settings.png" alt="" />
      <div class="notification-icon-container">
        <img id="notification-icon" class="icon" hide src="assets/img/notification-icon.png" alt="" srcset=""/>
        <div hide class="dot"></div>
      </div>

      <img hide id="logout-icon" src="assets/img/logout.png" alt="" srcset="" />
    </div>
    <div id="message-container"></div>

    <div hide class="main">

    </div>
    
    
  </body>
  `;
};
