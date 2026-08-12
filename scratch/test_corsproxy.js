const url = 'https://desustream.net/dstream/arcg/?id=V2Nua0VYdS9tQWdjVEg3R1UzdExnU0Q2WFpad0pnU2FTbUQ4Y1Qza1BEelIwT1RsMThoRmY4ZkRUMEVqZ0tXeA==';

async function test(proxy) {
  try {
    const res = await fetch(proxy + encodeURIComponent(url));
    console.log(proxy, res.status);
  } catch(e) {
    console.log(proxy, 'error');
  }
}

test('https://api.allorigins.win/raw?url=');
test('https://corsproxy.io/?url=');
