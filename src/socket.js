export default function socket(app) {
// Regular middleware
// Note it's app.ws.use and not app.use
  app.ws.use(function(ctx, next) {
    console.log("???");
    ctx.websocket.on('data', () => {
      console.log('Received data', arguments)
      ctx.websocket.send({event: 'ping'}, (err) => {
        console.log(arguments)
      });
    });

    return next(ctx);
  });
}
