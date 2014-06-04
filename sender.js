/**
 * Created by DarkRider on 04.06.2014.
 */

var amqp = require("amqplib/callback_api");
var common_options = {durable: true};

var nickname = "darkrider";
var connection = amqp.connect("amqp://fe-01.pharmhub.ru", function(err, conn) {
    conn.createChannel(function(err, channel) {
        channel.assertExchange("chat3", "direct", common_options, function(err, ok) {
            channel.publish("chat3", "main.chat", new Buffer(JSON.stringify({
                dt: new Date(),
                message: "Some message!",
                sender: nickname
            })), common_options);
            channel.publish("chat3", "direct." + nickname, new Buffer(JSON.stringify({
                dt: new Date(),
                message: "Some private message!",
                sender: nickname
            })), common_options);
        })
    });
});