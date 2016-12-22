module.exports = message => {
  const client = message.client;
  if (!message.event) return;
  switch (message.event) {
    case 'toggle': {
      if (message.data in client.commands) {
        client.log(`TOGGLING ${message.data}`);
        let command = client.commands[message.data];
        command.disabled = !command.disabled;
      }
      break;
    }
    default:
      break;
  }
}
