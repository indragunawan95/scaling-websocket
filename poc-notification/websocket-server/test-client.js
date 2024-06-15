const socket = new WebSocket('ws://localhost:8082');

socket.onopen = () => {
  console.log('WebSocket is open now.');
  socket.send('Hello Server!');
};

socket.onmessage = (event) => {
  console.log('Message from server: ', event.data);
};

socket.onerror = (error) => {
  console.log('WebSocket error: ', error);
};

socket.onclose = (event) => {
  console.log('WebSocket is closed now.');
};
