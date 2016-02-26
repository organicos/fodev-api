"use strict";

module.exports=function(app, mongoose, config, utils) {
    
    var Schema = mongoose.Schema;

    var Users = require('./../models/Users.js');
    
    var TicketUpdates = mongoose.model('TicketUpdates', {
        user: { type : Schema.Types.ObjectId, ref: 'Users', required: 'O responsável pela mensagem não foi informado!' }
        , msg: {
                type: String, 
                trim: true, 
                required: 'Favor informar a mensagem.'
        }
        , date: { type: Date, default: Date.now }
    });
    
    var Tickets = mongoose.model('Tickets', {
        kind: {
                type: String, 
                trim: true, 
                required: 'Favor informar o tipo de ticket.',
                match: [/contact|support|improvment/i, 'Tipo de ticket inválido.']
        },
        customer: { type : Schema.Types.ObjectId, ref: 'Users', required: 'Identifique o cliente!' },
        msg: {
                type: String, 
                trim: true, 
                required: 'Favor informar a mensagem.',
        },
        updates: [{ type : Schema.Types.ObjectId, ref: 'TicketUpdates' }],
        updated: { type: Date, default: Date.now }
    });
    
    app.get('/v1/tickets', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {};
        
        if(req.user.kind != 'admin') filter['customer._id'] = req.user._id;
        
        Tickets
        .find(filter, null, {sort: {updated: -1}})
        .lean()
        .populate(['customer'])
        .exec(function(err, tickets) {
                
            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(tickets);
                
            }
                
        });
    });
    
    app.get('/v1/ticket/:ticket_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        var filter = {_id: req.params.ticket_id};
        
        if(req.user.kind != 'admin') filter['customer._id'] = req.user._id;
        
        Tickets.findOne(filter)
        .deepPopulate(['customer', 'updates.user', 'updates'])
        .exec(function(err, ticket) {
                
            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(ticket);
                
            }
                
        });

    });


    app.post('/v1/ticket/:ticket_id/update', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        var filter = {_id: req.params.ticket_id};
        
        if(req.user.kind != 'admin') filter['customer._id'] = req.user._id;
        
        Tickets.findOne(filter)
        .populate(['customer'])
        .exec(function(err, ticket) {

            if (err) {
                
                res.statusCode = 400;
                    
                res.json({
                    type: false,
                    data: "Erro: " + err
                });
                
            } else {
                
                TicketUpdates.create({
                    
                    msg: req.body.msg
                    
                    , user: req.body.isCustomerMessage ? ticket.customer._id : req.user._id

                }, function(err, ticketUpdate) {

                        if (err) {
                            
                            res.statusCode = 400;

                            res.send(err);
                        
                        } else {
                            
                            ticket.updates.push(ticketUpdate._id);
                            
                            ticket.save(function(err, updatedTicket) {
                
                                if (err) {
                                        
                                        res.statusCode = 400;
                
                                        return res.send(err);
                
                                } else {
                                    
                                    Tickets.deepPopulate(updatedTicket, ['customer', 'updates.user', 'updates'], function(err, updatedTicketPopulated) {
                                        
                                        if (err) {
                                                
                                                res.statusCode = 400;
                        
                                                return res.send(err);
                        
                                        } else {
                                            
                                            if(!req.body.isCustomerMessage && req.user._id != updatedTicketPopulated.customer._id){
                                                
                                                send_reply_email(updatedTicketPopulated);
                                                
                                            }
                                            
                                            res.json(updatedTicketPopulated);
                                            
                                        }
                                        
                                    });
                                    
                                }
                
                            });
                            
                        }

                });
                
            }
            
        });

    });
    
    
    app.post('/v1/ticket', utils.getRequestUser, function(req, res) {

        Users.findOne({email: req.body.email}, function(err, user) {

            if (err) {
                
                res.statusCode = 400;
                    
                res.json({
                    type: false,
                    data: "Erro: " + err
                });
                
            } else {
                    
                if (user) {
                    
                    createTicket(user._id);
                        
                } else {
                    
                    var crypto = require('crypto');
                    
                    Users.create({
    
                            name : req.body.name,
    
                            email : req.body.email,
                            
                            phone : req.body.phone,
                            
                            kind : 'contact',
                            
                            password : crypto.createHash('md5').update(req.body.email).digest('hex')
    
                    }, function(err, user) {
    
                            if (err) {
                                
                                res.statusCode = 400;
    
                                res.send(err);
                            
                            } else {
                                
                                user.password = req.body.email;
                                
                                createTicket(user._id, true);
                                
                            }
    
                    });

                }
            }
        });
        
        var createTicket = function(customer_id, newCustomer){

            Tickets.create({
    
                kind : req.body.kind,
    
                msg: req.body.msg,
                
                customer: customer_id
    
            }, function(err, ticket) {
    
                if (err) {
                        res.statusCode = 400;
                        res.send(err);
                } else {

                    Tickets.deepPopulate(ticket, ['customer', 'updates'], function(err, updatedticketPopulated) {
                    
                            if (err) {
                                    
                                    res.statusCode = 400;
                            
                                    return res.send(err);
                            
                            } else {
                                
                                if(newCustomer){
                                    
                                    send_ticket_email_new_customer(updatedticketPopulated);
                                    
                                } else {
                                    
                                    send_ticket_email(updatedticketPopulated);
                                    
                                }
            
                                res.json(updatedticketPopulated);
                                
                            }
                    
                    });
                                                        
                }
    
            });
        }
    });
        
    var send_ticket_email = function(ticket){
        
        utils.sendMail({
            template: 'tickets/' + ticket.kind
            , data: ticket
            , subject: 'Contato recebido'
            , receivers: ticket.customer.email
            , copyAdmins: true
        });
        
    }
    
    var send_ticket_email_new_customer = function(ticket){
        
        utils.sendMail({
            template: 'tickets/' + ticket.kind + '_new_customer'
            , data: ticket
            , subject: 'Contato recebido'
            , receivers: ticket.customer.email
            , copyAdmins: true
        });
        
    }
    
    var send_reply_email = function(ticket){
        
        utils.sendMail({
            template: 'tickets/reply'
            , data: ticket
            , subject: 'Contato'
            , receivers: ticket.customer.email
            , copyAdmins: true
        });
        
    }

}
