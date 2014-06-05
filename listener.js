/**
 * Created by DarkRider on 04.06.2014.
 */

var amqp = require("amqplib/callback_api");
var readline = require('readline');

var common_options = {durable: true};

var nickname = process.argv[2] || "guest";



var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var private_route = "*." + nickname;
var global_route = "chat.*";
var last_sender = "";

var private_queue = nickname + "_private";

function parse(msg, verb){
    try {
        var params = JSON.parse(msg.content.toString());
        params.dt = new Date(params.dt);
        if (params.sender != nickname) {
            last_sender = params.sender;
        }
        var message = params.dt.getHours() + ":" + params.dt.getMinutes() + " " + params.sender + " " + verb + ": " + params.message;
    }
    catch (e){
        message = "Error in " + verb + ": " + msg.content.toString();
    }
    return message;
}

function chat(channel, message, route){
    channel.publish("chat4", route, new Buffer(JSON.stringify({
        dt: new Date(),
        message: message,
        sender: nickname
    })), common_options);
}

amqp.connect("amqp://fe-01.pharmhub.ru", function(err, conn) {
    conn.createChannel(function(err, channel) {
        channel.assertQueue("", {exclusive:true}, function(err, ok) {
            var global_queue = ok.queue;
            channel.assertExchange("chat4", "topic", common_options, function(err, ok) {
                channel.bindQueue(global_queue, "chat4", global_route);
                channel.consume(global_queue, function(msg) {
                    console.log(parse(msg, "said"));
                    channel.ack(msg);
                }, common_options);
            });
        });
    });
    conn.createChannel(function(err, channel) {
        channel.assertQueue(private_queue, {exclusive:true}, function(err, ok) {
            var private_queue = ok.queue;
            channel.assertExchange("chat4", "topic", common_options, function(err, ok) {
                channel.bindQueue(private_queue, "chat4", private_route);
                channel.consume(private_queue, function(msg) {
                    console.log(parse(msg, "whispered"));
                    channel.ack(msg);
                }, common_options);
            });
        });
    });

    conn.createChannel(function(err, channel) {
        channel.assertExchange("chat4", "topic", common_options, function(err, ok) {
            rl.on('line', function (cmd) {
                var msg, route;
                if (cmd[0] == "-"){
                    var space = cmd.indexOf(" ");
                    var target = cmd.substr(1, space - 1).trim();
                    if (target = "-"){
                        if (last_sender){
                            target = last_sender;
                        } else {
                            target = nickname;
                        }
                    }
                    msg = cmd.substr(space).trim();
                    route = "direct." + target;
                } else {
                    route = "chat.main";
                    msg = cmd;
                }
                chat(channel, msg, route);
            });
        })
    });
});