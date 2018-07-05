// https://github.com/smilefam/SendBird-SDK-JavaScript/blob/master/SendBird.d.ts
// import SendBird from "sendbird"
import React from "react"
import ReactDOM from "react-dom"
import ChatWindow from "./components/ChatWindow"

console.log(window.userName);

class App extends React.Component {
  render() {
    return (
      <ChatWindow title={window.title} userId={window.userId} userName={window.userName} party={window.party} userType={window.userType}/>
    )
  }
}

ReactDOM.render(
  <App />,
  document.querySelector('#app')
);
