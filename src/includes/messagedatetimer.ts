import * as moment from 'moment';

export class MessageDateTimer {
  private timer: any;          // variable for setInterval() storage
  private delay: number;       // timer delay, default: 44sec
  private messages: any;       // array of messages
  enableForceStart: boolean;   // restart current timer by force
  enableLogMessages: boolean;  // toggle console messages (toggles only .log)
  logStyle: any = {            // custom console color settings
    background: '#222',
    color: '#bada55'
  };

  constructor(messages: any) {
    this.messages = messages;

    // defaults
    this.enableLogMessages = false;
    this.enableLogMessages = false;
    this.setTimerDelay(44);
  }

  // {type}-log {message} to console
  logMessage(message: string, type?: string){
    switch (type) {
      case 'error':
        console.error('MessageDateTimer: ' + message);
      break;
      case 'warn':
        console.warn('MessageDateTimer: ' + message);
      break;
      default:
        console.log('%c MessageDateTimer: ' + message,
        'background: ' + this.logStyle.background +
        ';color: ' + this.logStyle.color);
      break;
    }
  }

  // Get time from all visible {messages}
  getMessagesDate() {
    if (this.messages.lenght > 0) {
      for (let i in this.messages) {
        this.messages[i].dateStr = moment(this.messages[i].created_at).fromNow();
      }
    } else {
      this.logMessage('There are no messages to update', 'warn');
    }
  }

  // Set timer {delay} in seconds
  setTimerDelay(delay?: number) {
    this.delay = delay ? delay * 1000 : 44;
  }

  // Start {timer}
  start() {
    if (this.enableLogMessages) {
      this.logMessage('Starting timer...');
    }
    if (this.messages) {
      if (this.enableForceStart || !this.timer) {
        this.getMessagesDate();
        this.timer = setInterval(() => {
          this.getMessagesDate();
        }, this.delay);
      } else {
        this.logMessage(
          'Cant\'t start timer. There are already runing one or try to set enableForceStart: true',
          'error');
      }
    } else {
      this.logMessage(
        'There are no messages to update or timer is already runing',
        'error');
    }
  }

  // Stop {timer}
  stop() {
    if (this.enableLogMessages) {
      this.logMessage('Stoping timer...');
    }
    if (this.timer) {
      clearInterval(this.timer);
    } else {
      this.logMessage('There are no timer to stop.', 'error');
    }
  }
}
