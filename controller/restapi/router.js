let express = require('express');
let router = express.Router();
let format = require('date-format');


let serverFunctions = require('./client/serverFunctions');

module.exports = router;

router.use(function(req, res, next) {
    // console.log(format.asString('hh:mm:ss.SSS', new Date())+'::............ '+req.url+' .............');
    // console.log('Request: ' + JSON.stringify(req.body, null, 4) );
    // console.log('Query: ' + JSON.stringify(req.query, null, 4) );
    next(); // make sure we go to the next routes and don't stop here

    function afterResponse() {
        // console.log('.....')
        res.removeListener('finish', afterResponse);
        // console.log('res: ' + (res.statusCode==200)? 'Transaction Success' : 'Transaction Failed' );  
        // console.log('.....')          
    }    
    res.on('finish', afterResponse);    
});



router.get('/', serverFunctions.homeRedirect); // Homepage

router.get('/profile', serverFunctions.profile) // Profile page

router.get('/about-us', serverFunctions.aboutUs)

router.get('/location-hongkong', serverFunctions.hongkong) // Location 1 Race Page




// Iframe Game Loading...

router.get('/shatin-hongkong/cdn', serverFunctions.locationHongkong)


// Get Miniting Info

router.get('/getMintData', serverFunctions.getMintData)


router.get('/getProfile/:playerAddress', serverFunctions.getPlayerProfile);