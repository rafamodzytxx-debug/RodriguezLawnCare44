/**
 * RODRIGUEZ LAWNCARE - AI CALL WEBHOOK RECEIVER
 * This script receives call completions from Vapi / Retell
 * and formats the customer lead to send via WhatsApp / SMS to (254) 612-1399.
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const OWNER_PHONE = '+12546121399';

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/webhook/call-finished') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const messageType = payload.message?.type || payload.type;

        console.log(`[VAPI WEBHOOK] Received event: ${messageType}`);

        // Check if call finished or function triggered
        if (messageType === 'end-of-call-report' || messageType === 'tool-calls') {
          const callData = payload.message?.call || payload.call || {};
          const transcript = payload.message?.transcript || payload.transcript || '';
          const summary = payload.message?.summary || payload.summary || '';
          
          console.log('--- NEW CALL COMPLETED FOR RODRIGUEZ LAWNCARE ---');
          console.log(`Caller: ${callData.customer?.number || 'Unknown'}`);
          console.log(`Summary: ${summary}`);
          console.log(`Transcript excerpt: ${transcript.substring(0, 150)}...`);
          
          // Formatted lead message ready for WhatsApp/SMS
          const alertMessage = `🌱 *NEW CALL ORDER - RODRIGUEZ LAWNCARE*\n\n` +
            `📱 *Phone:* ${callData.customer?.number || 'Private'}\n` +
            `📝 *Call Summary:* ${summary || 'Customer scheduled an estimate.'}\n\n` +
            `Recorded in system. Check dispatch.`;

          console.log('\nReady to dispatch message to owner:');
          console.log(alertMessage);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success' }));
      } catch (err) {
        console.error('Error processing webhook:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Rodriguez LawnCare AI Voice Webhook Service is running.');
  }
});

server.listen(PORT, () => {
  console.log(`Rodriguez LawnCare AI Voice Receiver listening on port ${PORT}`);
});
