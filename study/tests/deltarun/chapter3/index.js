	// Background Color Changer Function
	function changecolor(el) {
		document.body.style.backgroundColor = el.value;
	}
	
      const CHANGE_ASPECT_RATIO = true;
		// Main Page Elements
      var bodyElement = document.getElementsByTagName("body")[0];
      var statusElement = document.getElementById("status");
      var progressElement = document.getElementById("progress");
      var spinnerElement = document.getElementById("spinner");
      var canvasElement = document.getElementById("canvas");
      var outputElement = document.getElementById("output");
      var outputContainerElement = document.getElementById("output-container");
      var qrElement = document.getElementById("QRCode");
      var qr2Element = document.getElementById("QR2Code");
      var qrButton = document.getElementById("QRButton");
      var qr2Button = document.getElementById("QR2Button");
      var pauseMenu = document.getElementById("pauseMenuContainer");
      var resumeButton = document.getElementById("resumeButton");
      var quitButton = document.getElementById("quitButton");

      const messageContainerElement = document.getElementById("message-container");
      const messagesElement = document.getElementById("messages");
      let rollbackMessages = [];

      let clearRollbackMessagesTimeoutId = -1;
      const showRollbackMessage = function (message) {
        let messages = "";
        rollbackMessages.push(message);
        rollbackMessages.forEach(m => messages += "<p>" + m + "</p>");

        messagesElement.innerHTML = messages;
        messageContainerElement.style.display = 'block';

        if (clearRollbackMessagesTimeoutId === -1) {
          clearTimeout(clearRollbackMessagesTimeoutId);
        }
        clearRollbackMessagesTimeoutId = setTimeout(clearRollbackMessages, 5000);
      };

      const clearRollbackMessages = function () {
        clearRollbackMessagesTimeoutId = -1;
        rollbackMessages = [];
        messageContainerElement.style.display = 'none';
      };
		
	  // for displaying contents of console to display as a single line of text
	  // stopload is set to 0, as to initialize it
	  var loadprogress = 0;
		
      var startingHeight, startingWidth;
      var startingAspect;
      var Module = {
        preRun: [],
        postRun: [],
        print: (function () {
          var element = document.getElementById("output");
          if (element) element.value = ""; // clear browser cache
          return function (text) {
		  
		  // for displaying contents of console to display as a single line of text
		  // if loading has started
			if (text === "Starting WAD") {
			// tells if statement below to display ALL loading strings
				loadprogress += 1;
			}
	  
			// if loading has started
			if (loadprogress === 1) {
			// allow console to be displayed as text on-screen
				Module.setStatus(text);
			}
			// if game has started
			// greater than or equal to just in case
			else if (loadprogress >= 2) {
			// then set load text to nothing
				Module.setStatus("");
			}
		    // back to normal shit
			
            if (arguments.length > 1)
              text = Array.prototype.slice.call(arguments).join(" ");
			// for normal console
            console.log(text);
            if (text === "Entering main loop.") {
              // It seems that this text ensures game is loaded.
              ensureAspectRatio();
			  // below are custom
			  // stops loading text on game run
			  loadprogress += 1;
              // This Forces 1920x1080 aspect ratio on game startup
              canvas.width = 1920;
              canvas.height = 1080;

			  // TRUE END of custom shit
            }
            if (element) {
              element.value += text + "\n";
              element.scrollTop = element.scrollHeight; // focus on bottom
            }
          };
        })(),
        printErr: function (text) {
          if (arguments.length > 1)
            text = Array.prototype.slice.call(arguments).join(" ");
          console.error(text);
        },
        canvas: (function () {
          var canvas = document.getElementById("canvas");

          return canvas;
        })(),
        setStatus: function (text) {
          if (!Module.setStatus.last)
            Module.setStatus.last = { time: Date.now(), text: "" };
          if (text === Module.setStatus.last.text) return;
          var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
          var now = Date.now();
          if (m && now - Module.setStatus.last.time < 30) return; // if this is a progress update, skip it if too soon
          Module.setStatus.last.time = now;
          Module.setStatus.last.text = text;
          if (m) {
            text = m[1];
            progressElement.value = parseInt(m[2]) * 100;
            progressElement.max = parseInt(m[4]) * 100;
            progressElement.hidden = false;
            spinnerElement.hidden = false;
          } else {
            progressElement.value = null;
            progressElement.max = null;
            progressElement.hidden = true;

            // If there are no status text, we are finished and can display
            // the canvas and hide the spinner
            if (!text) {
              spinnerElement.style.display = "none";
              canvasElement.style.display = "block";
            }
          }
          statusElement.innerHTML = text;
        },
        totalDependencies: 0,
        monitorRunDependencies: function (left) {
          this.totalDependencies = Math.max(this.totalDependencies, left);
          Module.setStatus(
            left
              ? "Preparing... (" +
                  (this.totalDependencies - left) +
                  "/" +
                  this.totalDependencies +
                  ")"
              : "All downloads complete."
          );
        },
      };
      Module.setStatus("Downloading...");
      window.onerror = function (event) {
        // TODO: do not warn on ok events like simulating an infinite loop or exitStatus
        Module.setStatus("Exception thrown, see JavaScript console");
        spinnerElement.style.display = "none";
        Module.setStatus = function (text) {
          if (text) Module.printErr("[post-exception status] " + text);
        };
      };

      // Route URL GET parameters to argc+argv
      if (typeof window === "object") {
        Module['arguments'] = window.location.search.substr(1).trim().split('&');
        // If no args were passed arguments = [''], in which case kill the single empty string.
        if (!Module['arguments'][0]) {
          Module['arguments'] = [];
        }
      }
	

		// Enable FPS Counter Button
	  var stopfps = 0;

		// End of Button Functions

      var g_pWadLoadCallback = undefined;
      function setWadLoadCallback( _wadLoadCallback ) 
      {
        g_pWadLoadCallback = _wadLoadCallback;
      }

      var g_pAddAsyncMethod = -1;

      function setAddAsyncMethod( asyncMethod )
      {
        g_pAddAsyncMethod = asyncMethod;
      }

      var g_pJSExceptionHandler = undefined;

      function setJSExceptionHandler( exceptionHandler )
      {
        if (typeof exceptionHandler == "function") {
            g_pJSExceptionHandler = exceptionHandler;
        } // end if
      } // end setJSExceptionHandler

      function hasJSExceptionHandler()
      {
        return (g_pJSExceptionHandler != undefined) && (typeof g_pJSExceptionHandler == "function");
      } // end hasJSExceptionHandler

      function doJSExceptionHandler( exceptionJSON )
      {
        if (typeof g_pJSExceptionHandler == "function") {
          var exception = JSON.parse( exceptionJSON );
          g_pJSExceptionHandler( exception );
        } // end if
      } // end doJSExceptionHandler

		// Get Files
      function manifestFiles()
      {
        return [ "runner.data",
        "runner.js",
        "runner.wasm",
        "audio-worklet.js",
        "audio_intronoise.ogg",
        "game.unx",
        "snd_bigcar_yelp.ogg",
        "snd_closet_fall.ogg",
        "snd_closet_impact.ogg",
        "snd_dtrans_drone.ogg",
        "snd_dtrans_flip.ogg",
        "snd_dtrans_heavypassing.ogg",
        "snd_dtrans_lw.ogg",
        "snd_dtrans_square.ogg",
        "snd_dtrans_twinkle.ogg",
        "snd_fountain_make.ogg",
        "snd_fountain_target.ogg",
        "snd_ghostappear.ogg",
        "snd_great_shine.ogg",
        "snd_him_quick.ogg",
        "snd_hitcar.ogg",
        "snd_hitcar_little.ogg",
        "snd_icespell.ogg",
        "snd_paper_rumble.ogg",
        "snd_paper_surf.ogg",
        "snd_revival.ogg",
        "snd_rurus_appear.ogg",
        "snd_smallcar_yelp.ogg",
        "snd_snowgrave.ogg",
        "snd_spell_pacify.ogg",
        "snd_usefountain.ogg",
        "mus/acid_tunnel.ogg",
        "mus/afterrain_inside.ogg",
        "mus/alarm_titlescreen.ogg",
        "mus/alley_ambience.ogg",
        "mus/alt_church_lobby.ogg",
        "mus/ambientwater_weird.ogg",
        "mus/annoying_prophecy.ogg",
        "mus/april_2012.ogg",
        "mus/audio_anotherhim.ogg",
        "mus/audio_darkness.ogg",
        "mus/audio_defeat.ogg",
        "mus/audio_drone.ogg",
        "mus/audio_story.ogg",
        "mus/baci_distort.ogg",
        "mus/baci_perugina.ogg",
        "mus/basement.ogg",
        "mus/battle.ogg",
        "mus/battle_preview.ogg",
        "mus/battle_preview_crisp.ogg",
        "mus/battle_vapor.ogg",
        "mus/bell_ambience.ogg",
        "mus/berdly_audience.ogg",
        "mus/berdly_battle_heartbeat_true.ogg",
        "mus/berdly_chase.ogg",
        "mus/berdly_descend.ogg",
        "mus/berdly_flashback.ogg",
        "mus/berdly_theme.ogg",
        "mus/bird.ogg",
        "mus/board4_rhythm.ogg",
        "mus/board_4.ogg",
        "mus/board_4_challenge.ogg",
        "mus/board_lancer_dig.ogg",
        "mus/board_ocean.ogg",
        "mus/board_sword_music.ogg",
        "mus/board_zelda.ogg",
        "mus/boxing_boss.ogg",
        "mus/boxing_boss_preview.ogg",
        "mus/boxing_boss_preview_crisp.ogg",
        "mus/boxing_game.ogg",
        "mus/card_castle.ogg",
        "mus/carol_appeared.ogg",
        "mus/castletown.ogg",
        "mus/castletown_empty.ogg",
        "mus/castle_funk_long.ogg",
        "mus/ch2_credits.ogg",
        "mus/ch3-practice_song_combined.ogg",
        "mus/ch3-practice_song_noguit.ogg",
        "mus/ch3_board1.ogg",
        "mus/ch3_board2.ogg",
        "mus/ch3_board3.ogg",
        "mus/ch3_karaoke_example_guitar_only_v2.ogg",
        "mus/ch3_karaoke_example_guit_only.ogg",
        "mus/ch3_karaoke_example_noguit.ogg",
        "mus/ch3_karaoke_example_noguitar_v2.ogg",
        "mus/ch3_karaoke_example_together_ex.ogg",
        "mus/ch3_karaoke_full.ogg",
        "mus/ch3_karaoke_no_guitar.ogg",
        "mus/ch3_karaoke_preview.ogg",
        "mus/ch3_karaoke_preview_crisp.ogg",
        "mus/ch3_south_of_the_border.ogg",
        "mus/ch3_tvtime.ogg",
        "mus/ch3_tvtime_guitar.ogg",
        "mus/ch4_battle.ogg",
        "mus/ch4_credits.ogg",
        "mus/ch4_extra_boss.ogg",
        "mus/ch4_first_intro.ogg",
        "mus/ch4_first_intro_breaking.ogg",
        "mus/charjoined.ogg",
        "mus/checkers.ogg",
        "mus/church_dark_study.ogg",
        "mus/church_hymn.ogg",
        "mus/church_lightning.ogg",
        "mus/church_lw.ogg",
        "mus/church_lw_night.ogg",
        "mus/church_wip.ogg",
        "mus/church_zone2_alt_longer_test.ogg",
        "mus/church_zone3.ogg",
        "mus/climb.ogg",
        "mus/coolbeat.ogg",
        "mus/creepychase.ogg",
        "mus/creepydoor.ogg",
        "mus/creepylandscape.ogg",
        "mus/cyber.ogg",
        "mus/cybercity.ogg",
        "mus/cybercity_alt.ogg",
        "mus/cybercity_old.ogg",
        "mus/cyberhouse.ogg",
        "mus/cybershop_christmas.ogg",
        "mus/cyber_battle.ogg",
        "mus/cyber_battle_end.ogg",
        "mus/cyber_battle_prelude.ogg",
        "mus/cyber_shop.ogg",
        "mus/d.ogg",
        "mus/darkchurch_intro.ogg",
        "mus/dark_place.ogg",
        "mus/deep_noise.ogg",
        "mus/dogcheck.ogg",
        "mus/dontforget.ogg",
        "mus/elevator.ogg",
        "mus/fanfare.ogg",
        "mus/field_of_hopes.ogg",
        "mus/field_of_hopes_preview.ogg",
        "mus/field_of_hopes_preview_crisp.ogg",
        "mus/findher.ogg",
        "mus/flashback_excerpt.ogg",
        "mus/forest.ogg",
        "mus/friendship.ogg",
        "mus/gallery.ogg",
        "mus/gameover_short.ogg",
        "mus/gerson_defeated.ogg",
        "mus/gerson_theme_intro.ogg",
        "mus/gerson_theme_nointro.ogg",
        "mus/giant_queen_appears.ogg",
        "mus/gigaqueen_pre.ogg",
        "mus/glacier.ogg",
        "mus/greenroom_detune.ogg",
        "mus/heartbeat.ogg",
        "mus/hip_shop.ogg",
        "mus/home.ogg",
        "mus/honksong.ogg",
        "mus/jitterbug.ogg",
        "mus/jitterbug_muffled.ogg",
        "mus/joker.ogg",
        "mus/keygen.ogg",
        "mus/kingboss.ogg",
        "mus/knight.ogg",
        "mus/knight_appears.ogg",
        "mus/kris_piano_lancer_waltz.ogg",
        "mus/kris_piano_last_prophecy.ogg",
        "mus/kris_piano_lower.ogg",
        "mus/kris_piano_prophecy.ogg",
        "mus/kris_piano_quiz.ogg",
        "mus/kris_piano_rouxls.ogg",
        "mus/kris_piano_sevenfour.ogg",
        "mus/kris_piano_shop.ogg",
        "mus/kris_piano_waitingroom.ogg",
        "mus/lancer.ogg",
        "mus/lancerfight.ogg",
        "mus/lancer_annoying.ogg",
        "mus/lancer_susie.ogg",
        "mus/legend.ogg",
        "mus/legend_altered.ogg",
        "mus/man.ogg",
        "mus/mansion.ogg",
        "mus/mansion_entrance.ogg",
        "mus/man_2.ogg",
        "mus/man_nes.ogg",
        "mus/me.ogg",
        "mus/menu.ogg",
        "mus/mike.ogg",
        "mus/mike_zone.ogg",
        "mus/minigame_kart.ogg",
        "mus/muffled_rain.ogg",
        "mus/muscle.ogg",
        "mus/music_guys.ogg",
        "mus/music_guys_intro.ogg",
        "mus/mus_birdnoise.ogg",
        "mus/mus_confession.ogg",
        "mus/mus_introcar.ogg",
        "mus/mus_knightthought.ogg",
        "mus/mus_race.ogg",
        "mus/mus_school.ogg",
        "mus/mus_temloopshort.ogg",
        "mus/napsta_alarm.ogg",
        "mus/nes_intro_extended_part2.ogg",
        "mus/newscast.ogg",
        "mus/nightmare_boss_heavy.ogg",
        "mus/nightmare_boss_links.ogg",
        "mus/nightmare_nes.ogg",
        "mus/night_ambience.ogg",
        "mus/noelle.ogg",
        "mus/noelleshouseoutside.ogg",
        "mus/noelle_distant.ogg",
        "mus/noelle_ferriswheel.ogg",
        "mus/noelle_house_wip.ogg",
        "mus/noelle_normal.ogg",
        "mus/noelle_school.ogg",
        "mus/northernlight.ogg",
        "mus/ocean.ogg",
        "mus/oldman_helps_out.ogg",
        "mus/ominous_message.ogg",
        "mus/ominous_stab_harsh.ogg",
        "mus/ominous_stab_harsh_2.ogg",
        "mus/ominous_worse.ogg",
        "mus/pianpian.ogg",
        "mus/prejoker.ogg",
        "mus/pumpkin_boss.ogg",
        "mus/queen.ogg",
        "mus/queen_boss.ogg",
        "mus/queen_car_radio.ogg",
        "mus/queen_intro.ogg",
        "mus/quiet_autumn.ogg",
        "mus/quiet_church.ogg",
        "mus/rain.ogg",
        "mus/raining.ogg",
        "mus/raining_in_church2.ogg",
        "mus/rhythm_knockdown_combined.ogg",
        "mus/rhythm_knockdown_no_guit.ogg",
        "mus/root_8bit.ogg",
        "mus/rouxls_battle.ogg",
        "mus/rtenna_zoom.ogg",
        "mus/rudebuster_boss.ogg",
        "mus/ruruskaado.ogg",
        "mus/sadchord2.ogg",
        "mus/second_church.ogg",
        "mus/shinkansen.ogg",
        "mus/shop1.ogg",
        "mus/sinedrone_danger.ogg",
        "mus/sinedrone_danger_high.ogg",
        "mus/sink_noise.ogg",
        "mus/smallpiano_room.ogg",
        "mus/sound_battle_bg.ogg",
        "mus/spamton_basement.ogg",
        "mus/spamton_battle.ogg",
        "mus/spamton_dance.ogg",
        "mus/spamton_happy.ogg",
        "mus/spamton_house.ogg",
        "mus/spamton_laugh_noise.ogg",
        "mus/spamton_meeting.ogg",
        "mus/spamton_meeting_intro.ogg",
        "mus/spamton_neo_after.ogg",
        "mus/spamton_neo_meeting.ogg",
        "mus/spamton_neo_mix_ex_wip.ogg",
        "mus/static_placeholder.ogg",
        "mus/statue2_level1.ogg",
        "mus/statue2_level2.ogg",
        "mus/statue2_level3.ogg",
        "mus/statue2_level4.ogg",
        "mus/statue2_level5.ogg",
        "mus/statue_chord_basic.ogg",
        "mus/statue_level1.ogg",
        "mus/statue_level2.ogg",
        "mus/statue_level3.ogg",
        "mus/statue_level4.ogg",
        "mus/stealth.ogg",
        "mus/strongwind_loop.ogg",
        "mus/susie_diner.ogg",
        "mus/s_neo.ogg",
        "mus/s_neo_clip.ogg",
        "mus/tenna_battle.ogg",
        "mus/tenna_battle_guitar.ogg",
        "mus/tenna_battle_old.ogg",
        "mus/tenna_battle_preview.ogg",
        "mus/tenna_battle_preview_crisp.ogg",
        "mus/tenna_island.ogg",
        "mus/tense.ogg",
        "mus/the_dark_truth.ogg",
        "mus/the_holy.ogg",
        "mus/thrashmachine.ogg",
        "mus/thrash_rating.ogg",
        "mus/tinnitus.ogg",
        "mus/tin_night.ogg",
        "mus/titan_battle.ogg",
        "mus/titan_pre.ogg",
        "mus/titan_spawn.ogg",
        "mus/titan_tower.ogg",
        "mus/town.ogg",
        "mus/town_day.ogg",
        "mus/trank.ogg",
        "mus/tvromance.ogg",
        "mus/tv_changingroom.ogg",
        "mus/tv_game.ogg",
        "mus/tv_hall_of_fame.ogg",
        "mus/tv_infrontof.ogg",
        "mus/tv_noise.ogg",
        "mus/tv_results_screen.ogg",
        "mus/tv_static_bad.ogg",
        "mus/tv_world.ogg",
        "mus/vs_susie.ogg",
        "mus/w.ogg",
        "mus/wet_tapdancing.ogg",
        "mus/wet_tapdancing2.ogg",
        "mus/wet_tapdancing_failed.ogg",
        "mus/wind.ogg",
        "mus/wind_highplace.ogg",
        "vid/tennaintrof1_compressed_28.mp4",
        "vid/tennaintrojpf1_compressed_28.mp4" ].join( ";");
      }

		// Verify Files
      function manifestFilesMD5()
      {
        return [ "1a1c74d4282ba41e12d75c58edefe6ad",
"536954f7cf0f327a3f882f6d16864100",
"6f323d3c886b09bf86db95ecfef4b507",
"e8f1e8db8cf996f8715a6f2164c2e44e",
"b918e8a58a182e585f600d51155925af",
"3afed3617e27d187611fcd684ee6d07f",
"5702b26db546b5fa9c26289b9bc43b93",
"063bd2ff1f1911c99b0697d14308c1c1",
"c7ed25446d9d34af39b7582d8986c6b3",
"0b597daa614408ddbaa1975842a9b3b3",
"51048bb67d91c9164fb7bc58e927288d",
"95b41929ccb24c2b07bcf3a5fbdb7ebf",
"17c3b4b7050a4a496ec3053452298c69",
"8a711625145c06aecfa1ada89f96da8d",
"5a6f6cd8f8cb29ca0e0c94f4f69bdcf8",
"6e9d3ebc5443326e112226932cd94561",
"67a2c565f995865a1db09be83a7f1bd1",
"9712eb470af1b2341031baf436e433da",
"29b9e9be74517abe7cd0cebda0100213",
"597ede9cae463224df535f7903a314d8",
"108ef3f257635a11357145914e7e7d7f",
"46a371150de31b6fa26e9a0665783628",
"f73b8638c7fa295d2d101dd9d4a5da73",
"40d9fb6cd468b63073854b11b8162ae5",
"1c469264e56d565596e9b5cc0165eb77",
"c7173576340af49fe80c1dd733d4501d",
"46f88c456820cb4d2f6b34635ba4942c",
"1e5291165d0c0fed2cafea09d4831583",
"4ee930c5506a1d4059330b4197ab1b41",
"03dfa5d2499ac3ff64379b30e87c9765",
"d69b08e2917175936e148719397a6d7d",
"259ae1b60ea0eda223b8933754303322",
"39e4a7f50d1ad95446521abd071f0cc3",
"7bc37403f8b5fa3670605efe00124d73",
"caf022c80f61de86254305e91d3563bd",
"909d8b3e0417de8aa932a0e7f7a5d65e",
"19d41e280f4e7f221f74f1cd01d32570",
"eda071c9a9f37d92103a6755b9fd59b4",
"1fb9c074e72dee38bb757d1f96353ad8",
"4c659ca8adb1ad8566282ba14315dd92",
"0d2f7a99ff6333a6c067c3cdc16e65c5",
"832d210df7f526db646b778389752ecb",
"163fb3286bc2b230da452acfb277dc12",
"8c44cb6c0ead7f3ac739ad969bc1ab0b",
"d63d52a05ec08fa3e8eb58451caacfee",
"3d47d41388d66e7d70b26f6cfe28b8ce",
"741d0675a2e4a21aa898485f1adbdf03",
"cced72991f8aa20cdfd1e279043a02d0",
"c95c7df37b5917a6a525a1f7b94f4115",
"422134e0ceecf447d1d95d7904a63989",
"2b9480b59e0318ffcc28cd5bc69a8513",
"50852fd28614467726de017e898bb94d",
"4f2521fefa6114262aba4da49c50fe70",
"65edd6ec4dde6f34263cb56af9524280",
"b2863fd291519b09a32b84c1f5d70d6c",
"4b249ad18eb4c40dbf9b75279b1db4fc",
"13f201e8f52c1ff0968005daf880f95d",
"ca2f01b54715b2032f6708ec2bb70c98",
"44d30635dd2fddfb61c05e4d588a16da",
"2afc4fe515a1f920a2310bc833edf986",
"f69621e628df59a3c7ef6efb1e9cd94c",
"882f3626a84f3588a5e9b7adb80e681e",
"10238d8ca4f8a8804d80385d879dd87d",
"4414784f2a8cc82b1e597f09635aa7a7",
"d86c263fd673f5e5675db6eaaf6646e0",
"d939094d4ef18da8413264e69b0ea783",
"1a043291cb669ab265ebe657298c1303",
"b2409c87ee2618d328c1bb2f293f1e7b",
"9c4b3d7ff70f5a27395d64480a537224",
"714166c76109808fa06612775bf8417c",
"600be0a11f392540343d01bb30ce9906",
"8b07be11256c314ad669fc974b90387c",
"b5d5eed5f205f8862b1b45c4e3777310",
"0c39648bdf8ca2ad95301e8196638e9d",
"90855f77060e84819fbf493c0c214c27",
"af81ebdf9920985d0ce068872ac009fc",
"22f147ddbff878f8a5d6b314d02f9333",
"c575797a423e209141865b962f9f92c0",
"2357eb40d96a917d8e2b09763724feea",
"7b5c9dbec1828df72d8c6203f2738be9",
"c1378cf3a7ae2d77efeca8843ca51824",
"4affb303913d88296c668eb5ac6f8d0c",
"b3693adb74ee2da880ab47ce50a0beca",
"99930fb065f9ca94c5382f518e6590a8",
"d5fb0a65a0b00f1a38ad8f274d7c6eb1",
"e6593c7f3c2a92742d445556289d8407",
"60a3533952fb67cabec56d48a3182797",
"ebf99c9858aa5dd4ac6237b12f0fd916",
"dcbcc7ba24c814de9bee2105acc3820e",
"359854e11f95321777f3e8df1d0e35e3",
"458e002c49c2d786617a695bc8469cf5",
"0063c7af891df2754213dc3397d9e793",
"5020c0cc79968b686671304bb872794f",
"49b34755344d236898b8470da5e6779c",
"2be72fd1d392a86e00dbe23147eb4636",
"bf59773c2d3f62f950138cba198465f8",
"61b94991994cc91ebc7420a49ea47f6c",
"c4e39988b0929d4c8ab708504ceb1248",
"e5fcdbde17e379df7b0ea04cd4047554",
"81385d6bca4c3928fcc328268d469c8f",
"bce8b7a8a9796c0d04434b26f3734bad",
"dc91b25bfb0de899202e53b563d000ae",
"6fa944426da106be5d63015335ccb17c",
"2dc9411e2fc6248c53001ed4d38daaf0",
"9ce913f149d1204572b01a38abff544c",
"ad5e192e01bd976ba1e4a23ce5d5ef39",
"97e9209008525f7d910721f4ace8efa7",
"936c8d0cb8f64524b98fa51f775e58d8",
"83340b10ba9fa0581fd39cfe26c92270",
"1a67e6ce6c8395170fd3d6697e31204f",
"043f12bedbccd1fb402e910f7be2f121",
"88875cb3ac1a99f04b739d61519c4dca",
"e2bb34f65d98c135d281d61b63c51b76",
"5d1d55c235d50fe088cca681d702925a",
"94b6b9b79dffaa03fdcde025fec7bed9",
"d116de4e8aa8e9484a62491d5d52eb54",
"7a254414daa7336e304b89819360a12b",
"4b926e56d6e206a8514e255bdb7b0bb5",
"7ca1a8de22e36a4878e5be6c993fdfcd",
"739a4cfe137c942195472b293e153a7a",
"424f052478d480f3adc248bd6e9810a5",
"4fe7d899de410959e39d7f33b1e0b9e8",
"6b695ac718eb2f28757c62d79d199ff7",
"47948f051f79fe201224a9fbdc07de9e",
"012dac1c3d10bbc108e19f540e1eec69",
"1cef51f93e6dbcf4163741505df961cc",
"16abc519fb2fc601b664cc8d3fdae7eb",
"c8bf4e58112d953ca9e7855c402c1e13",
"f7f65393c245b5fde4a7bd1e285c2b99",
"48d902592ae64424b646bb0f2ac23c64",
"1295ebecc6dac86a9b5e45db2bf2a8ba",
"97e55a447fce145f997550b2e25c5af4",
"9997e060daa05cc0a9bdb33613ebe87d",
"1601f29c92facd51b91bec118b29fa7b",
"f0e6552a8cad064cb90156a497eacd66",
"7a1f8573b461680f279b9db4f8aca635",
"3312e0eb9f378011b046f1468a5c9e00",
"603b36b691067b184fa244a261a4757c",
"89f32d25611c08cc83e06314f6b0d29f",
"1bc2a77146b55daba27c37946fa7d710",
"eeac38bbaa87fdfa3324f331480d482e",
"ada774f6f0560619359544826cbd5f0b",
"22a05f30c582c19c7e220b271735ab6f",
"1fa875ef6bc377520de1c15193f481dd",
"7212af3364678a24046a7836dbff3189",
"cbf3a4aa370ecad810092630c493c0d5",
"37f9719d5013e91939aad5aace5228cf",
"2a5f4e340d656b292eec9684fc6c568c",
"3d407240e2758034892ba7b6789e55db",
"3c03d4a70f156f85176785d5cf19750f",
"06178a5aa11b2f8b1875d06b8d7f7bf9",
"781442264845f8d4e8c604f156e16e75",
"f634d5a3e79714415d6fac1f6519e0e6",
"af27e37e42746889099bae637b8bd9dd",
"af427d97136f380b9e361b195b885217",
"e4c8222adddeafb167f17cc917074503",
"804eb6cd7520366899d6a66989d1ccb3",
"0ca3986044562fd0009ab955f7277490",
"45816622980df53dfa47bc4096cbf4df",
"b60654d00304a8fad2a3355b9526839b",
"2419315f0e6d1483b6319ba76099f2f3",
"74dbe1dc5ab8000b7177ac20b453dfce",
"5961c24d04e15dfbdc6e047846478fee",
"4bf8aab3bf5f5bb55bfb68856c44a71e",
"10abfee26b001d06342a6babbc259080",
"e85bb1f52b4b5b4192c11a5456d243b3",
"2afe7722392fc6ab8a757bd63d89d71a",
"a31dccf062f49160c4cfbb00d6ffe051",
"891366b99f2edd6da14fb3395891dd57",
"94cc78d5dd2a5bc19b23766162e47153",
"300915e4444d6e4fc703bb13c6101231",
"88046a3ced3e763d4e63479c058dcdb1",
"e992aa670ac135f31beae013d2d87757",
"20a89883018422859b6bc2759289e6e7",
"c5e8e5b459d9f7ae8fe5b6e9bba1d5a2",
"b44d35fbb8f80d803d2212824c672477",
"e9997e2bc9167226b2923e74a5a5779f",
"c2e4c25c3764aad0e67df386e2788751",
"311bbd8a7a1fab58c842a997bc869e49",
"e961a6fc4a7c34e9b4d0c8be1e0dde07",
"98a59909a0512abd9cb813efa8ddd8be",
"c8b3c279b639e54a8a6032254718128d",
"d589c7ecc52ea665bd7fe86665c798cc",
"51721780d8fed1c46236a0b161181422",
"d8beaeb1698c3d3764486a1b2c9bb90d",
"a056c744d2e1c5480aabc9a7bbbc990f",
"1476e98f74ae2587c5ce0a46002be272",
"4ec29b34cf16470e3e7fc2b68ece2fe7",
"95d84e3183b0f46e6a643b8bf7fb01ff",
"fe7a66abe39dcb4f3b2534c35fadd831",
"394e342cdb24132f85af816ab8548243",
"717a893578252151309a85782ed3b68f",
"28100338c55da65a18f37794278ee157",
"6332365c8942761649c211ab062244f5",
"be2682e04f849f6906e8205121753562",
"81ec18e8cd2880deebccce873e83056b",
"c6407543bf67a93a84f8316b283c46bc",
"ae41332fa28bf092fb03c46be5649352",
"8f816f6600687acf1c763067d8c2af11",
"f4096e53aecb58f8cce278e862780c40",
"2ddf3281fa5052a6b2c18e87b705f61d",
"1ca9c249943d2ef59c9413edba69b28d",
"7f568dbd7146626164ecdea89561278a",
"f08e2caff8897531128cdfb2d5e8fe71",
"3b3ea55e36bf2377e843d7190e5addb6",
"32713b9da19e25bce92e78a7fa01667a",
"e104d7d8c65fd26cf9dccf797f5358a7",
"d85a77183447fdd6019f77af480a4530",
"307a03a62572b76f49a428ec119b546b",
"717bba27166491817c4e51c0b8913495",
"d76ff76192a4718ad9d845516646dab1",
"8262bc85d3e0c09706d3b92508582a2e",
"be134132a3f08d13a16393759a66c995",
"15ca9c96dfa68b81062d99dab2432607",
"5913ff49d168ff8899256eb96e8133a1",
"77360b0f4971f6b4abb209c4f80ddd89",
"2c4a53fdbcc000c3fea8b31b4df31de8",
"2ac6c917cce800e7660d426e14854bff",
"c53d19c7fd847ac4a2db457ffb434f6c",
"f11149e3284bd3ced3f433545cac773a",
"d4c39720834b782bfe8bf8df1ad41adb",
"08e53d5b016a575a801bdb9bcbdc5d31",
"fb9c60c59c39d3746b08e912818162b1",
"dff9abdbfcdca14f16bb1f1601b5fad3",
"4dd520a7f1bbbc1074ded016d2fd8fea",
"8dda566ea2a6512ec08f5e6a84713b3f",
"afaf85789da28d3c91d7584d4d558846",
"cfb63b7994e829b0bf2950c22784a1d4",
"fabce0778f8f4e1c39236b3c935c099b",
"c3005fe59236b4cac7faf17e5617d07b",
"15fa8876e7cad54d1033bb6ee237c9ae",
"a5158f193d0025ff7ce9670333c885c7",
"484a2746fdd089adf2c647169f0f4885",
"226ef2189079409f4c61589756d60aa4",
"77e3745372f9e2a4855a091ee7d46fba",
"b20543ab5fff20d17d908db6f6156f30",
"052c3eefb3bb5e8e959b7d6db6661e51",
"2bf19594897cb007a1433386b0d27d63",
"165278e483f18da26384e7e6157b29fb",
"aec9fc6e15cda3919584c5ee76f8ad07",
"ee8ccb0db46f717df4fe00872c896d4c",
"bf893fe546f4136a175b9f41a05bd1c6",
"d12713b277ee0d161c3a693cedc8320a",
"260646b5fc7003523faae282c93bf065",
"571e7886a634cd57d2ec1f51c5bd8bf9",
"5cf3c86b83a622422c55ae48a7ffd711",
"7727fa679da98d75ddbcddc6ab0ca5f4",
"3ece3c0df9b45f8a835e07ca03f1bf67",
"f109579b28af366dbaed8f8f58639d19",
"d6143cb460b4081aa8e0a78dd0b5237c",
"6290ca8942332e69a5cfdc5c6bb101f2",
"32d4052d99f30daea5255a5ba6685b9a",
"57aa6b7aa394f7d234826019fd5f7780",
"2d19f11cbc7e0a08ee9668df623aee74",
"311c0150a1bd176a48e04dc1065fbca8",
"25dfcf4d7645667198709a11403166ee",
"5fcef722054e5077cde9517781563e7e",
"7cd78a20064c295048fb68bfed7cea6e",
"864259ca29f64d34d14ed4a7a2aea639",
"26c91d858e0000bc5d7fec498a9327b1",
"1cce018b8c6687e91410a165ffaebbd3",
"69380b46d04976b60d5c848a638591b4",
"b3fef1261f130aadf14e748fdba0d8fd",
"60417315bf0d9c90231b3f7f1d2dd448",
"16438c52b02032176f792bc99cfa8846",
"89bde7ec255877aaa6043ffff5fd0887",
"d3ca399401f5d87c52a761fe746ad19a",
"ff4c6be4c6267dbff22f798f8779e69d",
"2889a36cb31f216ebfa03c26b4a03234",
"5a48961a5c5988b7f0d1d2bff4bb08e0",
"0f73fa3dfd0bee1a2b42dd2852e1df95",
"f46558b403a1e99d7d6d4db8a61d9570",
"0f73fa3dfd0bee1a2b42dd2852e1df95",
"70b86c2dffa4ce3af5b28c8b6e80ddc2",
"3b67f4005cbeae87aaae6a9987b3c802",
"84c53c308fcf3d58506e3bb5e2c89a87",
"aa419973a1d172c5af980396a7a84ec5",
"4b42a9c72b1fb31ecc82ece18f4308ad",
"b3b6c3b3010197bd38d54726a2600196",
"e811c9be2061976ddc83da887f049c54",
"66572fd57a62b03f5c16a4ad9915f127",
"796be67d3ca4a22970cce0d67c09fd52",
"f7b1746dd276eb54db4334e7367ba089",
"365293d28be927511d9f2a78e0703589",
"4718d8f2d102a3ee0de17e343abf2edc",
"a55c211a931eec973395f4c094382c52",
"070b53446de895710775164c8e99c1a2",
"02026185beb4192b9f7d75e0c4f5ba46",
"d92092b0f899b5f821a49fac269ce166",
"f06b465115a57796fe8b4b54d2da4654",
"63a46bca3463063420480e7451268175",
"6385decd4038075b3d2d89d6ba58ffd7",
"b975ef9ba220175bccb1052fca809e61",
"75c30b3e4265e0926487f7555125ce97",
"81f4d013f08c8d95e57f0095bae61471",
"9ab5f73dc93f66c0428ab73267dfe674",
"21282e9fb3a2f18391d42c184512a615",
"403979ac8cd153bb2914445c743403dc",
"df2fc9c97332c9a09d1b5fd8f9535d16",
"6a48ed774e2c04177e8fde3689872035",
"2df7c77161eb1ce147b85ac87e6609d6",
"1866f154a87f0edd34f100edcf32ca0a",
"8592e85a446afca381ee56138b57c773",
"9fe0e0e9a546b4b377408e0620cd3234",
"2aa5e60561b83ab45e62a3e65cecb704",
"e52be439c3512d06a80bc8b89b9c65b9",
"a1b3c852f39d90a2803b8b4976a449ba",
"3e137f16719fb3723eb0f0add5686d6a" ];
      }

      function onFirstFrameRendered()
      {
          //console.log("First frame rendered!");
      }

      function onGameSetWindowSize(width,height)
      {
          if (startingHeight === undefined && startingWidth === undefined) {
              console.log("Initial window size set to width: " + width + ", height: " + height);

              startingHeight = height;
              startingWidth = width;
              startingAspect = startingWidth / startingHeight;
          }
      }

	// Trigger Ads
    function triggerAd(adId, _callback_beforeAd, _callback_afterAd, _callback_adDismissed, _callback_adViewed, _callback_adbreakDone) {
       // need to take a copy of the RValues represented
       var pRValueCopy = triggerAdPrefix( _callback_beforeAd, _callback_afterAd, _callback_adDismissed, _callback_adViewed, _callback_adbreakDone );
       var pCallbackBeforeAd = pRValueCopy + (0*16);
       var pCallbackAfterAd = pRValueCopy + (1*16);
       var pCallbackAdDismissed = pRValueCopy + (2*16);
       var pCallbackAdViewed = pRValueCopy + (3*16);
       var pCallbackAdBreakDone = pRValueCopy + (4*16);

       adBreak({
         "type": "reward",                    // The type of this placement
         "name": adId,                        // A descriptive name for this placement

         "beforeAd": () => {                  // Prepare for the ad. Mute and pause the game flow
           console.log("beforeAd");
           // trigger _callback_beforeAd to game
           doGMLCallback( pCallbackBeforeAd, { id:adId } );
         },
         "afterAd" : () => {                   // Resume the game and re-enable sound
           console.log("afterAd");
           // trigger _callback_afterAd to game
           doGMLCallback( pCallbackAfterAd, { id:adId } );
         },
         "beforeReward": (showAdFn) => {      // Show reward prompt (call showAdFn() if clicked)
           console.log("beforeReward");
           showAdFn();
           // Setup native prompt to indicate ad will load
           // Will not be setup by dev so this UX controlled by GXC
         },
         "adDismissed": () => {               // Player dismissed the ad before it finished
           console.log("adDismissed");
           // trigger _callback_adDismissed to game
           doGMLCallback( pCallbackAdDismissed, { id:adId } );
         },
         "adViewed": () => {                  // Player watched the ad–give them the reward.
           console.log("adViewed");
           // trigger _callback_adViewed to game
           doGMLCallback( pCallbackAdViewed, { id:adId } );
         },
         "adBreakDone": (placementInfo) => {  // Always called (if provided) even if an ad didn't show
           console.log("adBreakDone");
           // trigger _callback_adBreakDone to game
           doGMLCallback( pCallbackAdBreakDone, { id:adId } );
           triggerAdPostfix( pRValueCopy );
         }, 
       });
      }

      function ensureAspectRatio() {
        if (canvasElement === undefined) {
          return;
        }

        if (!CHANGE_ASPECT_RATIO) {
          return;
        }
        
        if (startingHeight === undefined && startingWidth === undefined) {
          return;
        }

        canvasElement.classList.add("active");

        const maxWidth = window.innerWidth;
        const maxHeight = window.innerHeight;
        var newHeight, newWidth;

        // Find the limiting dimension.
        var heightQuotient = startingHeight / maxHeight;
        var widthQuotient = startingWidth / maxWidth;

        if (heightQuotient > widthQuotient) {
          // Max out on height.
          newHeight = maxHeight;
          newWidth = newHeight * startingAspect;
        } else {
          // Max out on width.
          newWidth = maxWidth;
          newHeight = newWidth / startingAspect;
        }

        canvasElement.style.height = newHeight + "px";
        canvasElement.style.width = newWidth + "px";
      }
		// To Pause when it detects the Tab is inactive
      function pause() { // Don't change the name - GX Mobile calls it when the app becomes inactive.
        if (!canvasElement.classList.contains("active")) { // Wait for the canvas to load.
          return
        }
        
        GM_pause();
        pauseMenu.hidden = false;
        canvasElement.classList.add("paused");
      }
		// To Resume when it detects the Tab is Active
      function resume() {
        GM_unpause();
        pauseMenu.hidden = true;
        canvasElement.classList.remove("paused");
        canvasElement.classList.add("unpaused");
        enterFullscreenIfSupported();
        lockOrientationIfSupported();
      }

      function quitIfSupported() {
        if (window.oprt && window.oprt.closeTab) { /* GX Mobile API */
          window.oprt.closeTab();
        } else if (window.chrome && window.chrome.runtime && window.chrome.runtime.sendMessage) {
          window.chrome.runtime.sendMessage('mpojjmidmnpcpopbebmecmjdkdbgdeke', { command: 'closeTab' })
        }
      }

      function enterFullscreenIfSupported() {
        if (!window.oprt || !window.oprt.enterFullscreen) { /* GX Mobile API */
          return;
        }

        window.oprt.enterFullscreen();
        let viewStatus = GM_get_view_status();
        viewStatus.fullscreen = true;
        GM_set_view_status(viewStatus);
      }

      function lockOrientationIfSupported() {
        if (!window.oprt || !window.oprt.lockPortraitOrientation || !window.oprt.lockLandscapeOrientation) { /* GX Mobile API */
          return;
        }

        let viewStatus = GM_get_view_status();
        if (viewStatus.landscape === true && viewStatus.portrait === false) {
          window.oprt.lockPortraitOrientation();
        } else if (viewStatus.landscape === false && viewStatus.portrait === true) {
          window.oprt.lockPortraitOrientation();
        }
      }
		// uh, shit that no one cares about
      const resizeObserver = new ResizeObserver(() => {
        window.requestAnimationFrame(ensureAspectRatio);
        setTimeout(() => window.requestAnimationFrame(ensureAspectRatio), 100);
      });
      resizeObserver.observe(document.body);
		
		// Disable Scrolling on Mobile
      if (/Android|iPhone|iPod/i.test(navigator.userAgent)) {
        bodyElement.className = "scrollingDisabled";
        canvasElement.classList.add("animatedSizeTransitions");
        outputContainerElement.hidden = true;
      }

      document.addEventListener("visibilitychange", (event) => {
        if (document.visibilityState != "visible") {
          pause();
        }
      });

      window.addEventListener("load", (event) => {
        if ((!window.oprt || !window.oprt.enterFullscreen) && (!window.chrome || !window.chrome.runtime || !window.chrome.runtime.sendMessage)) {
          quitButton.hidden = true;
        }
      });

      setWadLoadCallback(() => {
        enterFullscreenIfSupported();
        lockOrientationIfSupported();
      });