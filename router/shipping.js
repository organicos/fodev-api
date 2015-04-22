"use strict";

module.exports=function(app, moment) {
    
    var today = moment().day();
    
    var forTuesday = [4, 5, 6];
    
    var forSaturday = [1, 2, 3, 7];
    
    app.get('/v1/shipping/next', function(req, res) {
        
        var shippingDates = [];
        
        if(forTuesday.indexOf(today) > -1){
            
            shippingDates = [
                moment().day(2).locale("pt-br").format('dddd, DD/MM/YYYY')
                , moment().day(6).locale("pt-br").format('dddd, DD/MM/YYYY')
                , moment().add(1, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY')
                , moment().add(1, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY')
                , moment().add(2, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY')
                , moment().add(2, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY')
                , moment().add(3, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY')
                , moment().add(3, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY')
            ];
            
        } else if(forSaturday.indexOf(today) > -1) {
            
            if(today != 7){
                shippingDates = [
                    moment().day(6).locale("pt-br").format('dddd, DD/MM/YYYY')
                    , moment().add(1, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY')
                    , moment().add(1, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY')
                    , moment().add(2, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY')
                    , moment().add(2, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY')
                    , moment().add(3, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY')
                    , moment().add(3, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY')
                    , moment().add(4, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY')
                ];   
            } else {
                shippingDates = [
                    moment().add(1, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY')
                    , moment().add(2, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY')
                    , moment().add(2, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY')
                    , moment().add(3, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY')
                    , moment().add(3, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY')
                    , moment().add(4, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY')
                    , moment().add(4, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY')
                    , moment().add(5, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY')
                ];  
            }
          
            
        }
        
        res.json(shippingDates);

    });
    
    app.get('/v1/shipping/following', function(req, res) {
        
        var nextShippingDate = [];
        
        if(forTuesday.indexOf(today) > -1){
            
            nextShippingDate = moment().day(2).locale("pt-br").format('dddd, DD/MM/YYYY');
            
        } else if(forSaturday.indexOf(today) > -1) {
            
            if(today != 7){

                nextShippingDate = moment().day(6).locale("pt-br").format('dddd, DD/MM/YYYY');
                
            } else {
                
                nextShippingDate = moment().add(1, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY');
                
            }
            
        }
        
        nextShippingDate = nextShippingDate[0].toUpperCase() + nextShippingDate.substring(1);
        
        res.send(nextShippingDate);

    });
    
}