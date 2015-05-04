"use strict";

module.exports=function(app, moment) {
    
    app.get('/v1/shipping/next', function(req, res) {
        
        var today = moment().day();

        var forTuesday = [5, 6, 0];
        
        var forSaturday = [1, 2, 3, 4];
        
        var shippingDates = [];
        
        if(forTuesday.indexOf(today) > -1){

            if(today == 0){
                shippingDates = [
                    moment().day(2).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                    , moment().day(6).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                    , moment().add(1, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                    , moment().add(1, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                    , moment().add(2, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                    , moment().add(2, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                    , moment().add(3, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                    , moment().add(3, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                ];
            } else {
                shippingDates = [
                    moment().add(1, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                    , moment().add(1, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                    , moment().add(2, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                    , moment().add(2, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                    , moment().add(3, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                    , moment().add(3, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                    , moment().add(4, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                    , moment().add(4, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                ];
            }

            
        } else if(forSaturday.indexOf(today) > -1) {
            
            shippingDates = [
                moment().day(6).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                , moment().add(1, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                , moment().add(1, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                , moment().add(2, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                , moment().add(2, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                , moment().add(3, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                , moment().add(3, 'weeks').day(6).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
                , moment().add(4, 'weeks').day(2).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase()
            ];   

            
        }
        
        res.json(shippingDates);

    });
    
    app.get('/v1/shipping/following', function(req, res) {
        
        var today = moment().day();
        
        var forTuesday = [0, 1, 2];
        
        var forSaturday = [3, 4, 5, 6];
        
        var nextShippingDate = [];
        
        if(forTuesday.indexOf(today) > -1){
            
            nextShippingDate = moment().day(2).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase();
                
        } else if(forSaturday.indexOf(today) > -1) {
            
            nextShippingDate = moment().day(6).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase();
            
        }
        
        nextShippingDate = nextShippingDate[0].toUpperCase() + nextShippingDate.substring(1);
        
        res.send(nextShippingDate);

    });
    
}