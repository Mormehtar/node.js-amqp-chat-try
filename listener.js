/**
 * Created by DarkRider on 04.06.2014.
 */

var amqp = require("amqplib/callback_api");

var common_options = {durable: true};
var nickname = "darkrider";

var global_queue = nickname + "_global2";
var private_queue = nickname + "_private2";
var private_route = "direct." + nickname;
var global_route = "main.chat";

var connection = amqp.connect("amqp://fe-01.pharmhub.ru", function(err, conn) {
    conn.createChannel(function(err, channel) {
        channel.assertQueue(global_queue, common_options, function(err, ok) {
            channel.assertExchange("chat3", "direct", common_options, function(err, ok) {
                channel.bindQueue(global_queue, "chat3", global_route, common_options);
                channel.consume(global_queue, function(msg) {
//                    console.log(global_route);
//                    console.log(msg.fields);
                    console.log(msg.content.toString());
                    channel.ack(msg);
                }, common_options);
            });
        });
    });
    conn.createChannel(function(err, channel) {
        channel.assertQueue(private_queue, common_options, function(err, ok) {
            channel.assertExchange("chat3", "direct", common_options, function(err, ok) {
                channel.bindQueue(private_queue, "chat3", private_route, common_options);
                channel.consume(private_queue, function(msg) {
//                    console.log(private_route);
//                    console.log(msg.fields);
                    console.log("Private:", msg.content.toString());
                    channel.ack(msg);
                }, common_options);
            });
        });
    });
});

//connection.then(function (connection) {
//    process.once('SIGINT', connection.close.bind(connection));
//    var channel = connection.createChannel();
//    channel.then(channel.assertQueue("main", common_options);
//    channel.then()
//    return channel;
//});