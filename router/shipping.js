"use strict";

module.exports=function(app, moment) {
    
    app.get('/v1/shipping/next', function(req, res) {
        
        var today = moment().day();

        var forWednesday = [5, 6, 0];
        
        var forSaturday = [1, 2, 3, 4];
        
        var shippingDates = [];
        
        if(forWednesday.indexOf(today) > -1){

            if(today == 0){
                shippingDates = [
                    moment().day(3).format('YYYY-MM-DD')
                    , moment().day(6).format('YYYY-MM-DD')
                    , moment().add(1, 'weeks').day(3).format('YYYY-MM-DD')
                    , moment().add(1, 'weeks').day(6).format('YYYY-MM-DD')
                    , moment().add(2, 'weeks').day(3).format('YYYY-MM-DD')
                    , moment().add(2, 'weeks').day(6).format('YYYY-MM-DD')
                    , moment().add(3, 'weeks').day(3).format('YYYY-MM-DD')
                    , moment().add(3, 'weeks').day(6).format('YYYY-MM-DD')
                ];
            } else {
                shippingDates = [
                    moment().add(1, 'weeks').day(3).format('YYYY-MM-DD')
                    , moment().add(1, 'weeks').day(6).format('YYYY-MM-DD')
                    , moment().add(2, 'weeks').day(3).format('YYYY-MM-DD')
                    , moment().add(2, 'weeks').day(6).format('YYYY-MM-DD')
                    , moment().add(3, 'weeks').day(3).format('YYYY-MM-DD')
                    , moment().add(3, 'weeks').day(6).format('YYYY-MM-DD')
                    , moment().add(4, 'weeks').day(3).format('YYYY-MM-DD')
                    , moment().add(4, 'weeks').day(6).format('YYYY-MM-DD')
                ];
            }

            
        } else if(forSaturday.indexOf(today) > -1) {
            
            shippingDates = [
                moment().day(6).format('YYYY-MM-DD')
                , moment().add(1, 'weeks').day(3).format('YYYY-MM-DD')
                , moment().add(1, 'weeks').day(6).format('YYYY-MM-DD')
                , moment().add(2, 'weeks').day(3).format('YYYY-MM-DD')
                , moment().add(2, 'weeks').day(6).format('YYYY-MM-DD')
                , moment().add(3, 'weeks').day(3).format('YYYY-MM-DD')
                , moment().add(3, 'weeks').day(6).format('YYYY-MM-DD')
                , moment().add(4, 'weeks').day(3).format('YYYY-MM-DD')
            ];   

            
        }
        
        res.json(shippingDates);

    });
    
    app.get('/v1/shipping/locations', function(req, res) {
        
        var shippingLocations = [
            {_id: 1, city: 'Florianópolis', state: 'SC', price : '6'}
            , {_id: 2,city: 'Palhoça', state: 'SC', price : '15'}
            , {_id: 3,city: 'São José', state: 'SC', price : '12'}
        ];
        
        res.json(shippingLocations);

    });
    
    app.get('/v1/shipping/following', function(req, res) {
        
        var today = moment().day();
        
        // orders until monday lunch time are delivered Wednesday
        var forWednesday = [0, 1, 2, 3];
        
        // orders until Thursday lunch time are delivered Saturday
        var forSaturday = [4, 5, 6];
        
        var nextShippingDate = [];
        
        if(forWednesday.indexOf(today) > -1){
            
            nextShippingDate = moment().day(3).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase();
                
        } else if(forSaturday.indexOf(today) > -1) {
            
            nextShippingDate = moment().day(6).locale("pt-br").format('dddd, DD/MM/YYYY').toUpperCase();
            
        }
        
        nextShippingDate = nextShippingDate[0].toUpperCase() + nextShippingDate.substring(1);
        
        res.send(nextShippingDate);

    });
    
}