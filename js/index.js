/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/* gloabl app management */
var myIndex = 0;
var set;
var temp;
var interval = null;
var settime;
var car;
var intervaldepart = null;
var settimedepart;
var settimeout;
var settimeauto;
var settimeRetourMenu;
var settimeSuiteTexte;
var intervalDecompteMenu;
var mycompte = 0;
var s;

var app = {
    switchOnline: function(isOnline){
        if(isOnline){
            online=document.getElementById("onlinelist");
            online.innerText = " En ligne";
            online.className = "ui-btn ui-btn-icon-right fa fa-signal online";
        } else {
            online=document.getElementById("onlinelist");
            online.innerText = " Hors ligne";
            online.className = "ui-btn ui-btn-icon-right fa fa-signal";
        }
    },
    //animation
    initializeAnime: function() {
        app.automatic();
    },
    //Demo
    initializeDemo: function() {
        app.carousel(1);
        app.revenirAuMenu(200000, 200);
    },
    // Application Constructor
    initialize: function() {
         app.revenirAuMenu(60000, 60);     
        this.bindEvents();
        if(app.getUrlVars()["stat"] == null){
            window.location.href="./index.html?stat=off&?id="+app.getUrlVars()["id"];
        }
        //On enlève offline
        app.switchOnline(1);
        //test online ou offline
        app.isOnline(
            // si on N'EST PAS connecté alors
            function(){
                //console.log("On remet le splascreen");
                //On est sur la page index.html et offline
                app.switchOnline(0);
                //On affiche le formulaire
                document.getElementById("contentoff").id = "content";
                window.alert("Pour passer en mode En Ligne cliquez sur le bouton Hors Ligne et vice versa!");
                //console.log("On affiche le formulaire");
             },
            // si on EST connecté
            function(){
                if($('#btn-save').length){  
                    $('#btn-save').show();
                }
                //Si on est sur la page index.html et on est online alors
                if(app.getUrlVars()["id"] == null){
                    app.switchOnline(1);
                    //console.log("On remet le splascreen");
                    //On vérifie l’existence d'une liste
                    setTimeout(function(){ db.listCOTexist();},500);
                    //On affiche le formulaire
                    document.getElementById("contentoff").id = "content";
                    //console.log("On affiche le formulaire");
                }else {
                    //On affiche le formulaire
                    document.getElementById("contentoff").id = "content";
                    //console.log("On affiche le formulaire");
                }
            }
        );
        //dev mobile
        //setTimeout(function(){app.receivedEvent('deviceready');},0);
    
    },

    //Initialisation list.html
    initializeList: function() {
        //On affiche online
        app.switchOnline(1);

        var parentElement = document.getElementById("contentlist");
        var listeningElement = parentElement.querySelector('.cot_admin_list');
        
        //afficher la liste
        db.listCOT();
        app.revenirAuMenu(60000, 60);
    },
    // Bind Event Listeners
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('online', this.onOnline, false);
        document.addEventListener('offline', this.onOffline, false);
    },
    // deviceready Event Handler
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // online Event Handler
    onOnline: function() {
        app.turnOnline();
    },
    // offline Event Handler
    onOffline: function() {
        app.turnOffline();
    },
    // direct validation of the form 
    checkStatus: function(e){
        var idform = app.getUrlVars()["id"],
        elems = $('form').find('input:required'),
        invalid = $.grep(elems, function(n){
            return(!n.attributes['disabled'] && !n.validity.valid);
        }),
        bool = $(invalid).size() == 0;
        document.getElementById("btn-send").className = "fa fa-paper-plane ui-btn ui-last-child "+(bool?"valid":"invalid");
        // si c'est un formulaire existant qu'on reprend alors on affiche les champs a completer        
        if(bool){
            app.closeMsg();
            $(elems).removeClass("error");
        } else {
            if(idform!="" && idform!=null){
                app.updateMsg("Voici votre formulaire à finaliser. Il vous reste "+ $(invalid).size() +" champ(s) à remplir." +  " <a href='#' onclick='return app.cancel()'>Retour à la liste</a>");
            }
            $(invalid).addClass("error");
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        
        //si il n'y a pas de ID dans url  alors c'est un nouveau formulaire dans index.html
        if(app.getUrlVars()["stat"] == "off") {
            setTimeout(function(){

                //console.log("<<<<<formulaire non existant offline>>>>");

                //On enleve les champs Select/Regi/Pays/Lat/Long
                document.getElementById("offlineForm").style.display = "none";
                // on met les input cachés en disabled
                $('#offlineForm').find('input').attr("disabled", true);
                // passer en status hors ligne
                app.turnOffline();
                // ajouter un listener sur le formulaire
                app.addSubmitForm();
                // ajouter un "validateur" de formulaire
                app.validForm();

                $('input:required').change(app.checkStatus);

            }, 2000);

        }
        //sinon si l'ID dans url est égal a "" alors c'est un nouveau formulaire dans index.html?id=
        else if(app.getUrlVars()["stat"] == "on" && app.getUrlVars()["id"] == "") {
            setTimeout(function(){
            var id = app.getUrlVars()["id"];
            //console.log("<<<<<formulaire non existant online>>>>");

            // supprime tout message afficher (si il y en a)
            app.closeMsg();
            // démarrer le plugin addressPicker
            app.addressPicker();
            // ajouter un listener sur le formulaire
            app.addSubmitForm();
            // ajouter un "validateur" de formulaire
            app.validForm();

            $('input:required').change(app.checkStatus);

            //teste liste exist ajout du retour a la liste
            db.listExistNewForm();

            }, 0);
        }
        //sinon on modifie un formulaire existant
        else if(app.getUrlVars()["stat"] == "on"){
            setTimeout(function(){
                var id = app.getUrlVars()["id"];
                //console.log("<<<<<formulaire existant>>>>");
                // remplir avec ces données le formulaire
                db.reditCOTForm(id);
                // démarrer le plugin addressPicker
                if(app.getUrlVars()["lat"] !="" && app.getUrlVars()["lng"] !=""){
                    var lat = app.getUrlVars()["lat"];
                    var lng = app.getUrlVars()["lng"];
                    app.addressPickerRedit(lat, lng);
                }
                else {
                    app.addressPicker();
                }
                // ajouter un listener sur le formulaire avec l'id de celui-ci
                app.addSubmitExistForm(id);
                // ajouter un "validateur" de formulaire
                app.validForm();

                $('input:required').change(app.checkStatus);
                    
                //teste liste exist ajout du retour a la liste
                db.listExistNewForm();
            }, 0);
        }
    },

    //on récupére l'id du formulaire à ouvrir
    getFormID: function(id){
        window.location.href="./index.html?stat=on&?id="+id;
    },

    //on retourne l'id du formulaire encours
    getID: function(){
        return app.getUrlVars()["id"];
    },

    //on récupére l'id du formulaire à ouvrir
    getFormLatLng: function(id){
        db.recupLatLng(id);
    },

    //on remplit le formulaire chargé avec ces données
    reditForm: function(name,tel,email,day,month,year,location,localisation,region,country,latitude,longitude,number,culled,timed_swim,distance_swim,other_chbx,range,method,remarks){

        document.getElementById('observer_name').value = name;
        document.getElementById('observer_tel').value = tel;
        document.getElementById('observer_email').value = email;
        document.getElementById('observation_day').value = day;
        document.getElementById('observation_month').value = month;
        document.getElementById('observation_year').value = year;
        document.getElementById('observation_location').value = location;
        document.getElementById('observation_localisation').value = localisation;
        document.getElementById('observation_region').value = region;
        document.getElementById('observation_pays').value = country;
        document.getElementById('observation_latitude').value = latitude;
        document.getElementById('observation_longitude').value = longitude;
        document.getElementById('observation_number').value = number;
        document.getElementById('observation_culled').value = culled;
        document.getElementById('counting_method_timed_swim').value = timed_swim;
        document.getElementById('counting_method_distance_swim').value = distance_swim;
        document.getElementById('counting_method_other').value = other_chbx;
        if(range.includes("shallow") == true){
            //console.log("shallow");
            document.getElementById("depth_range0").checked = true;
            document.getElementById("label_depth_range0").className = "ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-first-child ui-checkbox-on";
        } 

        if(range.includes("medium") == true){
            //console.log("medium");
            document.getElementById("depth_range1").checked = true;
            document.getElementById("label_depth_range1").className = "ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-first-child ui-checkbox-on";
        }

        if(range.includes("deep") == true){
            //console.log("deep");
            document.getElementById("depth_range2").checked = true;
            document.getElementById("label_depth_range2").className = "ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-first-child ui-checkbox-on";
        }

        if(method.includes("snorkelling") == true){
            //console.log("snorkelling");
            document.getElementById("observation_method0").checked = true;
            document.getElementById("label_observation_method0").className = "ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-first-child ui-checkbox-on";
        }

        if (method.includes("scuba diving") == true){
            //console.log("scuba diving");
            document.getElementById("observation_method1").checked = true;
            document.getElementById("label_observation_method1").className = "ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-first-child ui-checkbox-on";
        }

        document.getElementById('remarks').value = remarks;

        // validate le formulaire pour afficher les champs non remplis
        app.checkStatus();
    },

     //supprime un formulaire avec son id
    supprForm: function(id){
        if (confirm("Voulez-vous supprimer ce formulaire ?")) {
           db.updateCOT(id);
           //console.log("element supprimer id="+id);
           window.setTimeout("window.location.reload()", 500);
       }
    },

    //permet de recupérer l'id dans l'url
    getUrlVars: function () {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        return vars;
    },

    // Turn app to online mode
    turnOnline: function(){
        app.addressPicker();
        app.reloadForm();
        online=document.getElementById("onlinelist");
        app.switchOnline(1);
        online.addClass = "online";
        app.reloadForm();
    },
    // Turn app to offline mode
    turnOffline: function(){
        app.updateMsg("Bienvenue sur l’application Oreanet NC, cette application sert à enregistrer toute observation d’acanthaster en Nouvelle-Calédonie afin que nous puissions les étudier." + 
                      " <br> La partie Hors Ligne permet  l’enregistrement de vos observations lorsque vous n’avez pas internet. " +
                      " <br> La partie En ligne permet l’envoie immédiat  d’un formulaire d’observation ou de modifier et  d’envoyer ceux enregistrés hors connexion.");
    },

    // ser closing screen
    close: function(){
        console.log("CLOSE");

        window.scrollTo(0, 0);
        //test online ou offline
        app.isOnline(
            // si on N'EST PAS connecté alors
            function(){
                
                document.getElementById("msg-fin-enregistre").innerHTML = "Votre formulaire à bien été enregistré et vous pourrez l'envoyer lors de votre prochaine connexion à internet.";
            },
            // si on EST connecté
            function(){
                //on affiche le lien retour a la liste si elle exist
                db.listExistCLOSE();
            }
        );
        document.getElementById("devicereadyoff").id = "deviceready";
        var parentElement = document.getElementById("deviceready");
        var listeningElement = parentElement.querySelector('.onclose');
        listeningElement.className='event closing row vertical-align';
        listeningElement.addEventListener("transitionend",  function(e) {
           listeningElement.className='event closed row vertical-align';
        },false);
        document.getElementById("content").id = "contentoff";
    },

    // Reload form
    reloadForm: function() {

        app.isOnline(
            // si on N'EST PAS connecté alors
            function(){
                $("#form-cot_admin").trigger('reset');
                window.location.href="./index.html";
            },
            // si on EST connecté
            function(){
                app.getFormID("");
            }
        );
        
    },

    updateMsg: function(msg) {
        document.getElementById("msg").innerHTML = msg;
        document.getElementById("system-message-container").style.display = "block";
    },    

    showInfoMsg: function() {
        msg = "L'analyse de la présence des acanthasters nous permet de comprendre pour mieux agir. En nous signalant les acanthasters que vous rencontrez, vous nous aidez à protéger les récifs de Nouvelle-Calédonie.";
        app.updateMsg(msg);
    }, 

    closeMsg: function() {
        document.getElementById("system-message-container").style.display = "none";
    }, 

    addressPicker: function(){  
    $("#observation_localisation" ).addressPickerByGiro(
        {
        distanceWidget: true
        }); 
    },

    addressPickerRedit: function(lat, long){  
        $("#observation_localisation" ).addressPickerByGiro(
        {
            mapOptions: {
                zoom: 16,
                center: [lat, long],
                scrollwheel: true,
                zoomGesturesEnabled: true,
                scrollGesturesEnabled: true,
                mapTypeId: "hybrid"
            },
            distanceWidget: true,
            distanceWidgetRadius: 300,  /* meters */
            appendToAddressString: '',
            geocoderOptions: {
                language: "fr"
            },
            markerOptions: {
            
            draggable: true,
            visible: true,
            }
        });
    },

     //On mes des champs obligatoire a saisir
    validForm: function(){
        //test online ou offline
        app.isOnline(
            // si on N'EST PAS connecté alors les champs sont Name/Email/Date/Location
            function(){
                $("#form-cot_admin").validate({
                    rules: {
                        observer_name: {
                            minlength: 2,
                            required: true
                        },
                        observer_email: {
                            required: true,
                            email: true
                        },
                        observation_year: {
                            required: true
                        },
                        observation_location: {
                            required: true
                        }
                    },
                    highlight: function(element, errorClass, validClass) {
                        $(element).addClass(errorClass).removeClass(validClass);
                    },
                    unhighlight: function(element, errorClass, validClass) {
                        $(element).removeClass(errorClass).addClass(validClass);
                    }
                });
            },
            // si on EST connecté alors les champs son Name/Email/Date/Localisation/Lat/Long
            function(){
                $("#form-cot_admin").validate({
                    rules: {
                        observer_name: {
                            minlength: 2,
                            required: true
                        },
                        observer_email: {
                            required: true,
                            email: true
                        },
                        observation_year: {
                            required: true
                        },
                        observation_localisation: {
                            required: true
                        },
                        observation_latitude: {
                            required: true
                        },
                        observation_longitude: {
                            required: true
                        }
                    },
                    highlight: function(element, errorClass, validClass) {
                        $(element).addClass(errorClass).removeClass(validClass);
                    },
                    unhighlight: function(element, errorClass, validClass) {
                        $(element).removeClass(errorClass).addClass(validClass);
                    }
                });
            }
        );
    },

    //On utilise la fonction sql pour enregistrer les données
    addSubmitForm: function(){
        var save = "false";
        $('#form-cot_admin').submit(function() {
            //console.log("form submit");
            db.insertCOT($('#observer_name').val(), $('#observer_tel').val(), $('#observer_email').val(), $('#observation_day').val(), $('#observation_month').val(), $('#observation_year').val(),
                $('#observation_location').val(), $('#observation_localisation').val(), $('#observation_region').val(), 
                $('#observation_pays').val(),$('#observation_latitude').val(),$('#observation_longitude').val(),
                $('#observation_number').val(),$('#observation_culled').val(),
                $('#counting_method_timed_swim').val(), $('#counting_method_distance_swim').val(),$('#counting_method_other').val(),
                $('#depth_range0').prop('checked')?$('#depth_range0').val():"",
                $('#depth_range1').prop('checked')?$('#depth_range1').val():"",
                $('#depth_range2').prop('checked')?$('#depth_range2').val():"",
                $('#observation_method0').prop('checked')?$('#observation_method0').val():"",
                $('#observation_method1').prop('checked')?$('#observation_method1').val():"",
                $('#remarks').val(), app.getDateTime(), save);          
            return false;
    }); 
    },
    
    //on utilise la fonction sql pour modifier les données
    addSubmitExistForm: function(id){
        var save = "false";
        $('#form-cot_admin').submit(function() {
            //console.log("form submit");
            db.updateFormCot($('#observer_name').val(), $('#observer_tel').val(), $('#observer_email').val(), $('#observation_day').val(), $('#observation_month').val(), $('#observation_year').val(),
                $('#observation_location').val(), $('#observation_localisation').val(), $('#observation_region').val(), 
                $('#observation_pays').val(), $('#observation_latitude').val(), $('#observation_longitude').val(),
                $('#observation_number').val(), $('#observation_culled').val(), 
                $('#counting_method_timed_swim').val(), $('#counting_method_distance_swim').val(), $('#counting_method_other').val(),
                $('#depth_range0').prop('checked')?$('#depth_range0').val():"",
                $('#depth_range1').prop('checked')?$('#depth_range1').val():"",
                $('#depth_range2').prop('checked')?$('#depth_range2').val():"",
                $('#observation_method0').prop('checked')?$('#observation_method0').val():"",
                $('#observation_method1').prop('checked')?$('#observation_method1').val():"",
                $('#remarks').val(), id, save);          
            return false;
    }); 
    },

    saveForm: function(){
        var save = "true";
        event.preventDefault();
        if(app.getID()==""){
            //console.log("allo insert id");
            db.insertCOT($('#observer_name').val(), $('#observer_tel').val(), $('#observer_email').val(), $('#observation_day').val(), $('#observation_month').val(), $('#observation_year').val(),
                $('#observation_location').val(), $('#observation_localisation').val(), $('#observation_region').val(), 
                $('#observation_pays').val(),$('#observation_latitude').val(),$('#observation_longitude').val(),
                $('#observation_number').val(),$('#observation_culled').val(),
                $('#counting_method_timed_swim').val(), $('#counting_method_distance_swim').val(),$('#counting_method_other').val(),
                $('#depth_range0').prop('checked')?$('#depth_range0').val():"",
                $('#depth_range1').prop('checked')?$('#depth_range1').val():"",
                $('#depth_range2').prop('checked')?$('#depth_range2').val():"",
                $('#observation_method0').prop('checked')?$('#observation_method0').val():"",
                $('#observation_method1').prop('checked')?$('#observation_method1').val():"",
                $('#remarks').val(), app.getDateTime(), save);  
        }
        else {
            //console.log("allo save finaliz");
            db.updateFormCot($('#observer_name').val(), $('#observer_tel').val(), $('#observer_email').val(), $('#observation_day').val(), $('#observation_month').val(), $('#observation_year').val(),
                $('#observation_location').val(), $('#observation_localisation').val(), $('#observation_region').val(), 
                $('#observation_pays').val(), $('#observation_latitude').val(), $('#observation_longitude').val(),
                $('#observation_number').val(), $('#observation_culled').val(), 
                $('#counting_method_timed_swim').val(), $('#counting_method_distance_swim').val(), $('#counting_method_other').val(),
                $('#depth_range0').prop('checked')?$('#depth_range0').val():"",
                $('#depth_range1').prop('checked')?$('#depth_range1').val():"",
                $('#depth_range2').prop('checked')?$('#depth_range2').val():"",
                $('#observation_method0').prop('checked')?$('#observation_method0').val():"",
                $('#observation_method1').prop('checked')?$('#observation_method1').val():"",
                $('#remarks').val(), app.getID(), save);  
        }
        setTimeout(function(){app.cancel();},1000);
    },

    submitForm: function(){
        if($("#form-cot_admin" ).valid()){
            $("#form-cot_admin" ).submit();
        
            //test online ou offline
            app.isOnline(
                // si on N'EST PAS connecté alors
                function(){
                    window.setTimeout("app.close()", 800);
                },
                // si on EST connecté
                function(){}
            );

        } else {
            app.updateMsg("Votre formulaire contient "
                        + $("#form-cot_admin" ).validate().numberOfInvalids()
                        + "erreur(s), voir le détail ci-dessous.");
        }
    },

    loadForm: function(){
        document.getElementById("counting_method_timed_swim_chbx").checked = document.getElementById("counting_method_timed_swim").value.length>0?1:0;
        document.getElementById("counting_method_distance_swim_chbx").checked = document.getElementById("counting_method_distance_swim").value.length>0?1:0;
        document.getElementById("counting_method_other_chbx").checked = document.getElementById("counting_method_other").value.length>0?1:0;

        app.enable_timed_swim(document.getElementById("counting_method_timed_swim").value.length>0?true:false);
        app.enable_distance_swim(document.getElementById("counting_method_distance_swim").value.length>0?true:false);
        app.enable_other(document.getElementById("counting_method_other").value.length>0?true:false);
    },

    enable_timed_swim: function(status) {
        if(!status){
                document.getElementById("counting_method_timed_swim").value = "";
                document.getElementById("counting_method_timed_swim").setAttribute('readonly','readonly');
        } else {
                document.getElementById("counting_method_timed_swim").focus();
                document.getElementById("counting_method_timed_swim").removeAttribute('readonly');
        }
    },

    enable_distance_swim: function(status) {
        if(!status){
                document.getElementById("counting_method_distance_swim").value = "";
                document.getElementById("counting_method_distance_swim").setAttribute('readonly','readonly');
        } else {
                document.getElementById("counting_method_distance_swim").focus();
                document.getElementById("counting_method_distance_swim").removeAttribute('readonly');
        }
    },

    enable_other: function(status) {
        if(!status){
                document.getElementById("counting_method_other").value = "";
                document.getElementById("counting_method_other").setAttribute('readonly','readonly');
        } else {
                document.getElementById("counting_method_other").focus();
                document.getElementById("counting_method_other").removeAttribute('readonly');
        }
    },

    isOnline: function(no,yes){
        
            if(app.getUrlVars()["stat"] == "on"){
                if(yes instanceof Function){
                    yes();
                }
            }
        
            else if (app.getUrlVars()["stat"] == "off"){
                if(no instanceof Function){
                    no();
                }
            }
    },
    
    //Fonction pour afficher la date correctement
    getDateTime: function(){
        var datetime = "";
        var date = new Date();

        var mois    = ('0'+(date.getMonth()+1)).slice(-2);
        var jour    = ('0'+date.getDate()   ).slice(-2);
        var heure   = ('0'+date.getHours()  ).slice(-2);
        var minute  = ('0'+date.getMinutes()).slice(-2);

        datetime = jour + "/" + mois + "/" + date.getFullYear() + " à " + heure +":"+ minute;
        return datetime;
    },

    cancel: function(){
        window.location.href="./list.html";
    },

    changeStatut: function(){

        if(app.getUrlVars()["stat"] == "on" || app.getUrlVars()["stat"] == null){
            //console.log("passe mode offline");
            window.location.href="./index.html?stat=off&?id=";
        }
        
        else if(app.getUrlVars()["stat"] == "off"){
            //console.log("passe mode online");
            setTimeout(function(){ db.listCOTexist();},1000);
        }
        
    },

    changeStatutList: function(){
        window.location.href="./index.html?stat=off&?id=";
    },

    carousel: function(index) {
        myIndex=index;
        clearTimeout(set);
        clearTimeout(settime);
        clearInterval(interval);
        clearTimeout(settimedepart);
        clearInterval(intervaldepart);
        clearTimeout(settimeout);
        var i;
        var x = document.getElementsByClassName("mySlides");
        for (i = 0; i < x.length; i++) {
           x[i].style.display = "none";
        }
        if(myIndex == 1){
            var vdo1 = document.getElementById("vdo_1");
            vdo1.currentTime = 0; 
            var $video = $('#vdo_1'); 
            $video.on('canplaythrough', function() { this.play(); });
            car = 5;
            temp = 48;
            app.start(54000);
            settimeout = setTimeout(app.depart, 49000, 6000);
            set = setTimeout(app.carousel, 55200, 2);
        }
        if(myIndex == 2){
            document.getElementById("vdo_2").currentTime = 0;
            document.getElementById("vdo_2").play();
            car = 5;
            temp = 81;
            app.start(86000);
            settimeout = setTimeout(app.depart, 82000, 6000);
            set = setTimeout(app.carousel, 87200, 3);
        }
        if(myIndex == 3){
            document.getElementById("demo-suiv").style.display = "none";
            document.getElementById("vdo_3").currentTime = 0;
            document.getElementById("vdo_3").play();
            temp = 32;
            app.start(33000);
            set = setTimeout(app.carousel, 33000, 4);
        }
        if(myIndex == 4){
            var result1;
            var result2;
            var result3;
            var result4;
            var result5;
            var result6;
            var result7;
            return { 
            result1: x[myIndex-1].style.display = "inline-block", 
            result2: document.getElementById("pass-demo").style.display = "none", 
            result3: document.getElementById("p-titre-demo").style.display = "none", 
            result4: clearInterval(interval), 
            result5: document.getElementById("timer").style.display = "none",
            result6: document.getElementById("btns-demo").style.display = "none",
            result6: document.getElementById("demo-suiv").style.display = "none",
            result7: document.getElementById("demo").style.height = "100%"};
        }
        if (myIndex > x.length) {myIndex = 1}
        x[myIndex-1].style.display = "block";
            
        },

    stopcarousel: function () {
        clearTimeout(set);
        var z = document.getElementsByClassName("mySlides");
        z[myIndex-1].style.display = "none";
        document.getElementById("fin-demo").style.display = "inline-block";
        document.getElementById("pass-demo").style.display = "none";
        document.getElementById("p-titre-demo").style.display = "none";
        clearInterval(interval);
        document.getElementById("timer").style.display = "none";
        document.getElementById("btns-demo").style.display = "none";
        document.getElementById("demo-suiv").style.display = "none";
        document.getElementById("demo").style.height = "100%";
    },

    timer: function (){
        document.getElementById("timer").innerHTML = temp + " seconde(s) de vidéo restantes";
        if(temp != 0){
            temp--;
        }
    },

    start: function (time){
        interval = setInterval(app.timer, 1000);
        settime = setTimeout(app.action, time);
    },

    stop: function (){
        clearInterval(interval);  
    },

    decompte: function (){
        document.getElementById("demo-suiv").innerHTML = "Dans "+ car + " seconde(s) la demo suivante";
        if(car == 0){
            //console.log("ici");
            document.getElementById("demo-suiv").style.display = "none"; 
        }
        if(car != 0){
            car--;
        }

    },

    depart: function (time){
        document.getElementById("demo-suiv").innerHTML = "Dans 5 seconde(s) la demo suivante";
        document.getElementById("demo-suiv").style.display = "inline";
        intervaldepart = setInterval(app.decompte, 1000);
        settimedepart = setTimeout(app.stop, time);
    },

    automatic: function() {
        var i;
        var x = document.getElementsByClassName("Slides");
        for (i = 0; i < x.length; i++) {
           x[i].style.display = "none";  
        }
        mycompte++;
        if (mycompte > x.length) {mycompte = 1}    
        x[mycompte-1].style.display = "block";  
        settimeauto = setTimeout(function(){
            app.automatic();
            clearTimeout(settimeSuiteTexte);
            var a = document.getElementsByClassName("suite_texte");
            for(var i = 0, length = a.length; i < length; i++) {
                a[i].style.display = "none";
            }
            settimeSuiteTexte = setTimeout(function(){
                var b = document.getElementsByClassName("suite_texte");
                for(var i = 0, length = b.length; i < length; i++) {
                    b[i].style.display = "inline";
                }
            },5000);
        }, 10000);
    },

    redemarAuto: function() {
        clearTimeout(settimeauto);
        settimeauto = setTimeout(function(){
            app.automatic();
            clearTimeout(settimeSuiteTexte);
            var a = document.getElementsByClassName("suite_texte");
            for(var i = 0, length = a.length; i < length; i++) {
                a[i].style.display = "none";
            }
            settimeSuiteTexte = setTimeout(function(){
                var b = document.getElementsByClassName("suite_texte");
                for(var i = 0, length = b.length; i < length; i++) {
                    b[i].style.display = "inline";
                }
            },5000);
        }, 1000);
    },

    suite: function(){
        clearTimeout(settimeSuiteTexte);
        var b = document.getElementsByClassName("suite_texte");
        for(var i = 0, length = b.length; i < length; i++) {
            b[i].style.display = "inline";
        }
    },

    revenirAuMenu: function(seconde, decompte) {
        s = decompte;
        clearTimeout(settimeRetourMenu);
        clearInterval(intervalDecompteMenu);
        settimeRetourMenu = setTimeout(function(){window.location.href='./animation.html';}, seconde);
        intervalDecompteMenu = setInterval(function(){
            document.getElementById("decompteMenu").innerHTML = s + " s";
            s--;
        }, 1000);
    },

    retourMenu: function(){
        clearTimeout(settimeRetourMenu);
        window.location.href='./animation.html'; 
    }
};