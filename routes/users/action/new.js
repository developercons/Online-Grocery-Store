/* 
 * Users Routers *
 * Create User *
 * This route file contains apis for user creation operations
 * Functionalities Index: 
        ===================================================================================================
        | S.No. |  Type  |        URL        |   Function Call   | Controller |       Description         |
        ===================================================================================================
        |   1.  | Get    | /user/new         | createNewUser     | ***        | Page for new user form    |
        ---------------------------------------------------------------------------------------------------
        |   2.  | Post   | /user/new         | createNewUser     | users      | Insert new user record    |
        ---------------------------------------------------------------------------------------------------
*/

/* importing required files and packages */
const express = require('express');
const router = express.Router();
const userPassport = require('../../../config/passportUsers');
const data = require('../../../data');
const usersData = data.users;
const credentialsData = data.credentials;

// route to render to create new user form
router.get('/', (req, res) => {
    res.render('users/new');
});

// route to create new user into database
router.post('/', (req, res) => {
    let newUser = req.body;

    // checking null values
    if(!newUser.name) {
        res.status(400).json({ error: "Please provide your name." });
        return;
    } else if (!newUser.email) {
        res.status(400).json({ error: "Please provide your email id." });
        return;
    } else if (!newUser.mobile) {
        res.status(400).json({ error: "Please provide your contact number." });
        return;
    } else if (!newUser.password) {
        res.status(400).json({ error: "Please provide your account password." });
        return;
    } else if (!newUser.image) {
        newUser.image = null;
    } else if (newUser.image) {
        newUser.image = "/uploads/users-image/" + newUser.image;
    }

    // searching for an existing user
    usersData.getUserById(newUser.email).then((userJsonDocument) => {

        // validating received user information
        if (userJsonDocument == null) {
            // creating new json document in users collection 
            usersData.createNewUser(newUser.name, newUser.email, newUser.mobile, newUser.image).then((createUserDocument) => {

                // validating received user information
                if (createUserDocument == null) {
                    res.render('alerts/error', { 
                        code: 400,
                        message: `Invalid user input stream.`,
                        url: req.originalUrl
                    });
                } else {
                     // searching for an existing credential
                    credentialsData.getCredentialById(newUser.email).then((credentialJsonDocument) => {
                        // validating received user information
                        if (credentialJsonDocument == null) {
                            // creating new json document in credentials collection 
                            credentialsData.createNewCredential(newUser.email, newUser.password).then((userCredential) => {
                                res.status(200).json(userCredential);
                            });
                        } else {   // user document found
                            res.render('alerts/error', { 
                                code: 400,
                                message: `Credential with '${newUser.email}' email id is already a registered.`,
                                url: req.originalUrl
                            });
                        }
                    });
                }
            });
        } else {    // user document found
            res.render('alerts/error', { 
                code: 400,
                message: `User with '${newUser.email}' email id is already a registered.`,
                url: req.originalUrl
            });
        }
        
    }).catch((collectionError) => {
        res.render('alerts/error', {
            code: 500,
            message: collectionError,
            url: req.originalUrl
        });
    });
});

// exporting routing apis
module.exports = router;