var http = require('http')
var createHandler = require('github-webhook-handler')
var handler = createHandler({ path: '/regex/gitPush', secret: 'gitPush' })

function run_cmd(cmd, args, callback) {
    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var resp = "";

    child.stdout.on('data', function (buffer) { resp += buffer.toString(); });
    child.stdout.on('end', function () { callback(resp) });
}


http.createServer(function (req, res) {

    handler(req, res, function (err) {
        res.statusCode = 404
        res.end('no such location')
    })
}).listen(7777,() =>{
    console.log('WebHooks Listern at 7777');
})

handler.on('error', function (err) {
    console.error('Error:', err.message)
})


handler.on('push', function (event) {
    console.log('Received a push event for %s to %s',
        event.payload.repository.name,
        event.payload.ref);
        // 分支判断
        // if(event.payload.ref === 'refs/heads/main'){
        //     console.log('deploy master..')
        //     run_cmd('sh', ['./deploy-dev.sh'], function(text){ console.log(text) });
        // }
        run_cmd('sh', ['./deploy-dev.sh', event.payload.ref.split('/')[2]], function(text){ console.log(text) });
})



