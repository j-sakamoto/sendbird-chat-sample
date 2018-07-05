// https://github.com/smilefam/SendBird-SDK-JavaScript/blob/master/SendBird.d.ts
// https://docs.sendbird.com/javascript/group_channel_one_to_one_chat#3_creating_a_1_to_1_chat
import React from "react"
import PropTypes from 'prop-types';
import moment from 'moment';
import SendBird from "sendbird"
const APP_ID = "DF9CAD72-8FE3-4E6F-9EE0-48F6AB2F9E17"
const sb = new SendBird({ appId: APP_ID })

class ChatWindow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      channel: null,
      messages: [],
      input: ""
    }
    this.boardRef = React.createRef();
    this.inputRef = React.createRef();
    this.sendMessage = this.sendMessage.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  render() {
    return (
      <div className="ChatWindow">
        <div className="ChatWindow-Header">
          { this.props.title }
        </div>
        <div className="ChatWindow-Board" ref={this.boardRef}>
          {
            this.state.messages.map(message => (
              <div key={message.messageId} className={`message-wrapper ${message.data}`}>
                <p className="message">
                  <span className="name">{message._sender.nickname}</span>
                  <span className="text">{message.message}</span>
                </p>
                <p className="date">{moment(message.createdAt).format("M/D h:mm")}</p>
              </div>
            ))
          }
        </div>
        <div className="ChatWindow-Footer">
          <input type="text" className="inputarea" onKeyDown={this.onKeyDown} placeholder="メッセージを入力" value={this.state.input} onChange={this.handleInputChange}/>
          <button className="button" onClick={this.sendMessage}>送信</button>
        </div>
      </div>
    )
  }

  componentDidMount() {
    console.log("mounted");
    this.connect()
      .then(_user => this.setUserName())
      .then(_user => this.createChannel())
      .then(channel => this.ensurePreviousMessages(channel))
      .then(_messages => this.sctollToBottom())
      .catch(err => console.error(err))
  }

  connect() {
    return new Promise((resolve, reject) => {
      sb.connect(this.props.userId, (user, err) => {
        if (err) return reject(err);
        this.setChannelHandler()
        resolve(user)
      })
    })
  }

  setChannelHandler() {
    const channelHandler = new sb.ChannelHandler()
    channelHandler.onMessageReceived = (receivedChannel, message) => {
      console.log(receivedChannel);
      window.c = receivedChannel
      if (receivedChannel == this.state.channel) {
        this.appendMessage(message)
      }
    }
    sb.addChannelHandler('ChatView', channelHandler)
  }

  setUserName() {
    return new Promise((resolve, reject) => {
      // nickname: string, profileUrl: string
      sb.updateCurrentUserInfo(this.props.userName, null, (user, err) => {
        if (err) return reject(err);
        resolve(user)
      })
    })
  }

  createChannel() {
    return new Promise((resolve, reject) => {
      // nickname: string, profileUrl: string
      sb.GroupChannel.createChannelWithUserIds(this.userIds, true, (channel, err) => {
        if (err) return reject(err);
        this.setState({ channel: channel });
        resolve(channel)
      })
    })
  }

  ensurePreviousMessages(channel) {
    let query = channel.createPreviousMessageListQuery()
    window.q = query
    return new Promise((resolve, reject) => {
      // count: Integer, reverse: Boolean, callback
      query.load(10, false, (messages, err) => {
        if (err) return reject(err);
        this.setState({ messages: messages });
        console.log(messages);

        resolve(messages)
      })
    })
  }

  componentWillUnmount() {
    sb.disconnect()
  }

  get userIds() {
    return [this.props.userId, ...this.props.party]
  }

  onKeyDown(e) {
    if (e.keyCode !== 13) return;
    this.sendMessage(e)
  }

  sendMessage(e) {
    console.log(e.target);

    e.preventDefault()
    if (this.state.input.length == 0) return;

    // message: String, data: String(such as JSON String), handler: Function
    this.state.channel.sendUserMessage(this.state.input, this.props.userType, (message, error) => {
      if (error) {
        console.error(error);
        return;
      }
      this.appendMessage(message)
      this.setState({input: ""})
      console.log("send message succeed");
    })
  }

  appendMessage(message) {
    this.setState({ messages: [...this.state.messages, message] })
    this.sctollToBottom()
  }

  handleInputChange(event) {
    this.setState({ input: event.target.value.trim() });
  }

  sctollToBottom() {
    this.boardRef.current.scrollTop = this.boardRef.current.scrollHeight
  }
}

ChatWindow.propTypes = {
  title: PropTypes.string,
  userId: PropTypes.string,
  userName: PropTypes.string,
  party: PropTypes.array,
  userType: PropTypes.string,
  input: PropTypes.string,
}

module.exports = ChatWindow
