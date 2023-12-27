/* vim: set ts=2 sw=2 sts=2 */

const api = "/mountfarmtool.php?op=";
const yesText = "✓";
const noText = "✗";
const overriddenText = "🥳";

var tr_ARR, tr_HW, tr_SB, tr_ShB, tr_EW, tr_savage, tr_minion;
for (var rule of document.styleSheets[1].cssRules) {
  switch (rule.selectorText) {
    case "tr.ARR":
      tr_ARR = rule.style;
      break;
    case "tr.HW":
      tr_HW = rule.style;
      break;
    case "tr.SB":
      tr_SB = rule.style;
      break;
    case "tr.ShB":
      tr_ShB = rule.style;
      break;
    case "tr.EW":
      tr_EW = rule.style;
      break;
    case "tr.savage":
      tr_savage = rule.style;
      break;
    case "tr.minion":
      tr_minion = rule.style;
      break;
  }
}

const settings_ui = document.getElementById("settings_ui");
const select_datacenter = document.getElementById("select_datacenter");
const select_server = document.getElementById("select_server");
const input_fcname = document.getElementById("input_fcname");
const input_excluded_ranks =
  document.getElementById("input_excluded_ranks");
const button_apply = document.getElementById("button_apply");
const button_cancel = document.getElementById("button_cancel");
const button_settings = document.getElementById("button_settings");
const button_copy_link = document.getElementById("button_copy_link");

var datacenter;
var server;
var fc_name;
var excluded_ranks;

const status_elements = document.getElementById("status_elements");
const status_text = document.getElementById("status_text");
const spinner = document.getElementById("spinner");
const searchselect = document.getElementById("searchselect");
const mounts_table = document.getElementById("mounts_table");
const mounts_table_header =
  document.getElementById("mounts_table_header");
const mounts_table_body = document.getElementById("mounts_table_body");
const first_th = document.getElementById("first_th");
const hide_complete = document.getElementById("hide_complete");
const select_expansion = document.getElementById("select_expansion");
const toggle_savage = document.getElementById("toggle_savage");
const toggle_minion = document.getElementById("toggle_minion");
var fc_id = 0;
var url = new URL(document.URL);
var fc_members = {};
const savageIcon = "✴️";
const minionIcon = "Ⓜ️";
var mounts = {
  "Aithon"                  : { ID:  28, expansion: "ARR", quest: "The Bowl of Embers (Extreme)", boss:"Ifrit", owners: [], type: "mount", },
  "Gullfaxi"                : { ID:  30, expansion: "ARR", quest: "The Navel (Extreme)", boss: "Titan", owners: [], type: "mount", },
  "Xanthos"                 : { ID:  29, expansion: "ARR", quest: "The Howling Eye (Extreme)", boss: "Garuda", owners: [], type: "mount", },
  "Enbarr"                  : { ID:  31, expansion: "ARR", quest: "The Whorleater (Extreme)", boss: "Leviathan", owners: [], type: "mount", },
  "Markab"                  : { ID:  40, expansion: "ARR", quest: "The Striking Tree (Extreme)", boss: "Ramuh", owners: [], type: "mount", },
  "Boreas"                  : { ID:  43, expansion: "ARR", quest: "The Akh Afah Amphitheatre (Extreme)", boss: "Shiva", owners: [], type: "mount", },
  "Nightmare"               : { ID:  22, expansion: "ARR", quest: "The Howling Eye (Extreme)<br/>The Navel (Extreme)<br/>The Bowl of Embers (Extreme)", boss: "Garuda, Titan, Ifrit", owners: [], type: "mount", },
  "Kirin"                   : { ID:  47, expansion: "ARR", quest: "A Legend for a Legend", boss: null, owners: [], type: "mount", },
  "Wind-up Onion Knight" : { ID: 92, expansion: "ARR", quest: "Syrcus Tower", boss: "Xande", owners: [], type: "minion", },
  "Puff Of Darkness" : { ID: 101, expansion: "ARR", quest: "The World Of Darkness", boss: "Cloud of Darkness", owners: [], type: "minion", },

  "Rose Lanner"             : { ID:  76, expansion: "HW",  quest: "Thok ast Thok (Extreme)", boss: "Ravana", owners: [], type: "mount", },
  "White Lanner"            : { ID:  75, expansion: "HW",  quest: "The Limitless Blue (Extreme)", boss: "Bismarck", owners: [], type: "mount", },
  "Round Lanner"            : { ID:  77, expansion: "HW",  quest: "The Minstrel's Ballad: Thordan's Reign", boss: "Thordan", owners: [], type: "mount", },
  "Dark Lanner"             : { ID:  90, expansion: "HW",  quest: "The Minstrel's Ballad: Nidhogg's Rage", boss: "Nidhogg", owners: [], type: "mount", },
  "Warring Lanner"          : { ID:  78, expansion: "HW",  quest: "Containment Bay S1T7 (Extreme)", boss: "Sephirot", owners: [], type: "mount", },
  "Sophic Lanner"           : { ID:  98, expansion: "HW",  quest: "Containment Bay P1T6 (Extreme)", boss: "Sophia", owners: [], type: "mount", },
  "Demonic Lanner"          : { ID: 104, expansion: "HW",  quest: "Containment Bay Z1T9 (Extreme)", boss: "Zurvan", owners: [], type: "mount", },
  "Firebird"                : { ID: 105, expansion: "HW",  quest: "Fiery Wings, Fiery Hearts", boss: null, owners: [], type: "mount", },
  "Gobwalker"               : { ID:  58, expansion: "HW", quest: "Alexander - The Burden Of The Father (Savage)", boss: "The Manipulator", owners: [], type: "savage", },
  "Arrhidaeus"              : { ID: 101, expansion: "HW", quest: "Alexander - The Soul Of The Creator (Savage)", boss: "Alexander Prime", owners: [], type: "savage", },
  "Wind-up Echidna" : { ID: 160, expansion: "HW", quest: "The Void Ark", boss: "Echidna", owners: [], type: "minion", },
  "Faustlet"                : { ID: 176, expansion: "HW", quest: "Alexander - The Burden Of The Son (Savage)", boss: "Brute Justice", owners: [], type: "minion", },
  "Wind-up Calofisteri" : { ID: 195, expansion: "HW", quest: "The Weeping City Of Mhach", boss: "Calofisteri", owners: [], type: "minion", },
  "Toy Alexander"           : { ID: 215, expansion: "HW", quest: "Alexander - The Soul Of The Creator<br/>Alexander - The Soul Of The Creator (Savage)", boss: "Alexander Prime", owners: [], type: "minion", },
  "Wind-up Scathach" : { ID: 232, expansion: "HW", quest: "Dun Scaith", boss: "Diabolos", owners: [], type: "minion", },

  "Reveling Kamuy"          : { ID: 116, expansion: "SB",  quest: "The Pool of Tribute (Extreme)", boss: "Susano", owners: [], type: "mount", },
  "Blissful Kamuy"          : { ID: 115, expansion: "SB",  quest: "Emanation (Extreme)", boss: "Lakshmi", owners: [], type: "mount", },
  "Legendary Kamuy"         : { ID: 133, expansion: "SB",  quest: "The Minstrel's Ballad: Shinryu's Domain", boss: "Shinryu", owners: [], type: "mount", },
  "Lunar Kamuy"             : { ID: 158, expansion: "SB",  quest: "The Minstrel's Ballad: Tsukuyomi's Pain", boss: "Tsukuyomi", owners: [], type: "mount", },
  "Auspicious Kamuy"        : { ID: 144, expansion: "SB",  quest: "The Jade Stoa (Extreme)", boss: "Byakko", owners: [], type: "mount", },
  "Euphonious Kamuy"        : { ID: 172, expansion: "SB",  quest: "Hells' Kier (Extreme)", boss: "Suzaku", owners: [], type: "mount", },
  "Hallowed Kamuy"          : { ID: 182, expansion: "SB",  quest: "The Wreath of Snakes (Extreme)", boss: "Seiryu", owners: [], type: "mount", },
  "Kamuy Of The Nine Tails" : { ID: 181, expansion: "SB",  quest: "A Lone Wolf No More", boss: null, owners: [], type: "mount", },
  "Alte Roite"              : { ID: 126, expansion: "SB", quest: "Deltascape V4.0 (Savage)", boss: "Exdeath", owners: [], type: "savage", },
  "Air Force"               : { ID: 156, expansion: "SB", quest: "Sigmascape V4.0 (Savage)", boss: "Kefka", owners: [], type: "savage", },
  "Model O"                 : { ID: 173, expansion: "SB", quest: "Alphascape V4.0 (Savage)", boss: "Omega", owners: [], type: "savage", },
  "Wind-up Exdeath"         : { ID: 259, expansion: "SB", quest: "Deltascape V4.0<br/>Deltascape V4.0 (Savage)", boss: "Exdeath", owners: [], type: "minion", },
  "Wind-up Kefka"           : { ID: 281, expansion: "SB", quest: "Sigmascape V4.0<br/>Sigmascape V4.0 (Savage)", boss: "Kefka", owners: [], type: "minion", },
  "Construct 8" : { ID: 299, expansion: "SB", quest: "The Ridorana Lighthouse", boss: "Yiazmat", owners: [], type: "minion", },
  "OMG" : { ID: 305, expansion: "SB", quest: "Alphascape V4.0<br/>Alphascape V4.0 (Savage)", boss: "Omega", owners: [], type: "minion", },
  "Wind-up Ramza" : { ID: 270, expansion: "SB", quest: "The Orbonne Monastery", boss: "Ultima", owners: [], type: "minion", },

  "Fae Gwiber"              : { ID: 189, expansion: "ShB", quest: "The Dancing Plague (Extreme)", boss: "Titania", owners: [], type: "mount", },
  "Innocent Gwiber"         : { ID: 192, expansion: "ShB", quest: "The Crown of the Immaculate (Extreme)", boss: "Innocence", owners: [], type: "mount", },
  "Shadow Gwiber"           : { ID: 205, expansion: "ShB", quest: "The Minstrel's Ballad: Hades's Elegy", boss: "Hades", owners: [], type: "mount", },
  "Gwiber Of Light"         : { ID: 226, expansion: "ShB", quest: "The Seat of Sacrifice (Extreme)", boss: "Elidibus", owners: [], type: "mount", },
  "Ruby Gwiber"             : { ID: 217, expansion: "ShB", quest: "Cinder Drift (Extreme)", boss: "The Ruby Weapon", owners: [], type: "mount", },
  "Emerald Gwiber"          : { ID: 238, expansion: "ShB", quest: "Castrum Marinum (Extreme)", boss: "The Emerald Weapon", owners: [], type: "mount", },
  "Diamond Gwiber"          : { ID: 249, expansion: "ShB", quest: "The Cloud Deck (Extreme)", boss: "The Diamond Weapon", owners: [], type: "mount", },
  "Landerwaffe"             : { ID: 245, expansion: "ShB", quest: "The Dragon Made", boss: null, owners: [], type: "mount", },
  "Skyslipper"              : { ID: 188, expansion: "ShB", quest: "Eden's Gate: Sepulture (Savage)", boss :"Titan", owners: [], type: "savage", },
  "Ramuh"                   : { ID: 219, expansion: "ShB", quest: "Eden's Verse: Refulgence (Savage)", boss: "Shiva", owners: [], type: "savage", },
  "Eden"                    : { ID: 234, expansion: "ShB", quest: "Eden's Promise: Eternity (Savage)", boss: "Oracle of Darkness", owners: [], type: "savage", },
  "Eden Minor" : { ID: 341, expansion: "ShB", quest: "Eden's Gate: Sepulture<br/>Eden's Gate: Sepulture (Savage)", boss: "Titan", owners: [], type: "minion", },
  "Pod 054" : { ID: 364, expansion: "ShB", quest: "The Copied Factory", boss: "9S-operated Walking Fortress", owners: [], type: "minion", },
  "Pod 316" : { ID: 365, expansion: "ShB", quest: "The Copied Factory", boss: "9S-operated Walking Fortress", owners: [], type: "minion", },
  "Wind-up Ryne" : { ID: 332, expansion: "ShB", quest: "Eden's Verse: Refulgence<br/>Eden's Verse: Refulgence (Savage)", boss: "Shiva", owners: [], type: "minion", },
  "2B Automaton" : { ID: 394, expansion: "ShB", quest: "The Puppets' Bunker", boss: "Compound 2P", owners: [], type: "minion", },
  "2P Automaton" : { ID: 395, expansion: "ShB", quest: "The Puppets' Bunker", boss: "Compound 2P", owners: [], type: "minion", },
  "Wind-up Gaia" : { ID: 398, expansion: "ShB", quest: "Eden's Promise: Eternity<br/>Eden's Promise: Eternity (Savage)", boss: "Eden's Promise", owners: [], type: "minion", },
  "Smaller Stubby" : { ID: 415, expansion: "ShB", quest: "The Tower At Paradigm's Breach", boss: "Her Inflorescence", owners: [], type: "minion", },
  "9S Automaton" : { ID: 419, expansion: "ShB", quest: "The Tower At Paradigm's Breach", boss: "Her Inflorescence", owners: [], type: "minion", },

  "Lynx Of Eternal Darkness": { ID: 261, expansion: "EW",  quest: "The Minstrel's Ballad: Zodiark's Fall", boss: "Zodiark", owners: [], type: "mount", },
  "Lynx Of Divine Light"    : { ID: 262, expansion: "EW",  quest: "The Minstrel's Ballad: Hydaelyn's Call", boss: "Hydaelyn", owners: [], type: "mount", },
  "Bluefeather Lynx"        : { ID: 293, expansion: "EW",  quest: "The Minstrel's Ballad: Endsinger's Aria", boss: "The Endsinger", owners: [], type: "mount", },
  "Lynx Of Imperious Wind"  : { ID: 306, expansion: "EW",  quest: "Storm's Crown (Extreme)", boss: "Barbariccia", owners: [], type: "mount", },
  "Lynx Of Righteous Fire"  : { ID: 315, expansion: "EW",  quest: "Mount Ordeals (Extreme)", boss: "Rubicante", owners: [], type: "mount", },
  "Lynx Of Fallen Shadow"   : { ID: 325, expansion: "EW",  quest: "The Voidcast Dais (Extreme)", boss: "Golbez", owners: [], type: "mount", },
  "Demi-Phoinix"            : { ID: 265, expansion: "EW", quest: "Asphodelos: The Fourth Circle (Savage)", boss: "Hesperos", owners: [], type: "savage", },
  "Sunforged"               : { ID: 305, expansion: "EW", quest: "Abyssos: The Eighth Circle (Savage)", boss: "Hephaistos", owners: [], type: "savage", },
  "Megaloambystoma"         : { ID: 319, expansion: "EW", quest: "Anabaseios: The Twelfth Circle (Savage)", boss: "Athena", owners: [], type: "savage", },
  "Wind-up Azeyma"          : { ID: 451, expansion: "EW", quest: "Aglaia", boss: "Nald'thal", owners: [], type: "minion", },
  "Wind-up Erichthonios"    : { ID: 466, expansion: "EW", quest: "Abyssos: The Eighth Circle<br/>Abyssos: The Eighth Circle (Savage)", boss: "Hephaistos", owners: [], type: "minion", },
  "Wind-up Halone"          : { ID: 474, expansion: "EW", quest: "Euphrosyne", boss: "Menphina", owners: [], type: "minion", },
  "Wind-up Athena"          : { ID: 487, expansion: "EW", quest: "Anabaseios: The Twelfth Circle<br/>Anabaseios: The Twelfth Circle (Savage)", boss: "Athena", owners: [], type: "minion", },
  "Wind-up Oschon"          : { ID: 494, expansion: "EW", quest: "Thaleia", boss: "Eulogia", owners: [], type: "minion", },

};

function loadFCMembers() {
  updateStatus("Loading FC Members ...");
  /* Get the members. */
  window.fetch(api + "me&id=" + fc_id).then(
    (response) => response.json().then(
      (data) => {
        /* We are replacing any existing options, so empty the element first. */
        searchselect.replaceChildren();
        var option;
        var excluded_ranks_array = excluded_ranks.split(",").map((x) => x.trim());
        for (entry of data) {
          /* Filter out ranks: Silent Warriors, Coffee Interns */
          if (!excluded_ranks_array.includes(entry.rank)) {
            fc_members[entry.name] = entry.id;
            option = document.createElement("option");
            option.textContent = option.value = entry.name;
            searchselect.appendChild(option);
          }
        }
        tomselect.sync();
        var character_selection =
          sessionStorage.getItem("character_selection");
        if (character_selection) {
          tomselect.setValue(JSON.parse(character_selection));
        } else {
          updateStatus("");
        }
      }
    ),
    (error) => {
      updateStatus("ERROR loading FC members :(");
    }
  );
}

/* Sequential loading of mounts to avoid overloading the api. */
var mount_queue = [];
var mounts_loading = false;

function loadMounts(name) {
  mount_queue.push(name);
  if (!mounts_loading) {
    mountQueue();
  }
}

function mountQueue() {
  if (mount_queue.length) {
    mounts_loading = true;
    loadMount(mount_queue.shift());
  } else {
    mounts_loading = false;
    updateStatus("");
  }
}

/* Load the mounts of a given character. */
function loadMount(name) {
  var characterID = fc_members[name];
  updateStatus("Loading character mounts ...");
  window.fetch(api + `mo&id=${characterID}`).then(
    (response) => response.json().then(
      (data) => {
        var mount_names = Object.keys(mounts).map(x => x.toLowerCase());
        for (var mount of data) {
          if (mount_names.includes(mount.toLowerCase())) {
            try {
              mounts[mount].owners.push(characterID);
            } catch (error) {
              console.log("ERROR WITH:", mount);
              throw error;
            }
          }
        }
        window.fetch(api + `mi&id=${characterID}`).then(
          (response) => response.json().then(
            (data) => {
              var mount_names = Object.keys(mounts).map(x => x.toLowerCase());
              for (var minion of data) {
                if (mount_names.includes(minion.toLowerCase())) {
                  try {
                    mounts[minion].owners.push(characterID);
                  } catch (error) {
                    console.log("ERROR WITH:", minion);
                    throw error;
                  }
                }
              }
              updateTable(name, characterID);
              mountQueue();
            }
          )
        );
      }
    )
  );
}

function updateStatus(text="") {
  if (text) {
    status_text.textContent = text;
    status_elements.style.display = "";
    tomselect.disable();
    hide_complete.disabled = true;
    select_expansion.disabled = true;
    toggle_savage.disabled = true;
    toggle_minion.disabled = true;
    button_settings.disabled = true;
  } else {
    status_elements.style.display = "none";
    tomselect.enable();
    hide_complete.disabled = false;
    select_expansion.disabled = false;
    toggle_savage.disabled = false;
    toggle_minion.disabled = false;
    button_settings.disabled = false;
    set_hide_complete();
    set_hide_expansions();
    set_hide_savage();
    set_hide_minion();
  }
}

function updateTable(name, characterID) {
  var th = document.createElement("th");
  th.textContent = name;
  mounts_table_header.appendChild(th);
  for (var mount_name of Object.keys(mounts)) {
    var td = document.createElement("td");
    if (mounts[mount_name].owners.includes(characterID)) {
      td.classList.add("yes");
      td.textContent = yesText;
    } else {
      if (overrides[mount_name].includes(characterID)) {
        td.classList.add("overridden");
        td.textContent = overriddenText;
      } else {
        td.classList.add("no");
        td.textContent = noText;
      }
      td.addEventListener("click", function(event) {
        overrideMount(event);
      });
    }
    mounts[mount_name].tr.appendChild(td);
  }
}

/* Source: https://stackoverflow.com/a/4649936 */
function whichChild(elem){
  var  i= 0;
  while((elem=elem.previousSibling)!=null) ++i;
  return i;
}

function overrideMount(event) {
  var mount_name =
    event.target.parentElement.firstElementChild.childNodes[0].nodeValue;
  var index = whichChild(event.target);
  var character_name = mounts_table_header.children[index].textContent;
  var id = fc_members[character_name];
  if (event.target.classList.contains("no")) {
    /* Determine mount name and character ID. */
    overrides[mount_name].push(id);
    mounts[mount_name].owners.push(id);
    event.target.textContent = overriddenText;
    event.target.classList.remove("no");
    event.target.classList.add("overridden");
  } else {
    var pos = mounts[mount_name].owners.indexOf(id);
    mounts[mount_name].owners.splice(pos, 1);
    pos = overrides[mount_name].indexOf(id);
    overrides[mount_name].splice(pos, 1);
    event.target.textContent = noText;
    event.target.classList.remove("overridden");
    event.target.classList.add("no");
  }
  sessionStorage.setItem("overrides", JSON.stringify(overrides));
}

function removeCharacter(name) {
  var i = 0;
  for (var th of mounts_table_header.children) {
    if (name == th.textContent) {
      break;
    }
    ++i;
  }
  mounts_table_header.children[i].remove();
  for (var tr of mounts_table_body.children) {
    tr.children[i].remove();
  }
}

function full_complete(x) { return !x.classList.contains("no"); }

function old_complete(x) { return x.classList.contains("yes"); }

function reset_complete(x) { return false; }

function set_hide_complete (event) {
  if (!tomselect.getValue().length) { return; }
  var comp_func;
  switch (hide_complete.value) {
    case "0":
      comp_func = reset_complete;
      break;
    case "1":
      comp_func = old_complete;
      break;
    default:
      comp_func = full_complete;
  }
  for (var tr of mounts_table_body.children) {
    if (Array.from(tr.children).slice(1).every(comp_func)) {
      tr.style.display = "none";
    } else {
      tr.style.display = "";
    }
  }
  sessionStorage.setItem("hide_complete", hide_complete.selectedIndex);
}

function set_hide_expansions (event) {
  var tr_ARR_display = "none";
  var tr_HW_display = "none";
  var tr_SB_display = "none";
  var tr_ShB_display = "none";
  var tr_EW_display = "none";
  switch (select_expansion.value) {
    case "ARR":
      tr_ARR_display = "";
      break;
    case "HW":
      tr_HW_display = "";
      break;
    case "SB":
      tr_SB_display = "";
      break;
    case "ShB":
      tr_ShB_display = "";
      break;
    case "EW":
      tr_EW_display = "";
      break;
    default: /* All */
      tr_ARR_display = "";
      tr_HW_display = "";
      tr_SB_display = "";
      tr_ShB_display = "";
      tr_EW_display = "";
  }
  tr_ARR.setProperty("display", tr_ARR_display);
  tr_HW.setProperty("display", tr_HW_display);
  tr_SB.setProperty("display", tr_SB_display);
  tr_ShB.setProperty("display", tr_ShB_display);
  tr_EW.setProperty("display", tr_EW_display);
  sessionStorage.setItem("hide_expansions", select_expansion.selectedIndex);
}

function set_hide_savage (event) {
  tr_savage.setProperty("display",
          (toggle_savage.checked) ? "table-row" : "none");
  sessionStorage.setItem("show_savage", Number(toggle_savage.checked));
}

function set_hide_minion (event) {
  tr_minion.setProperty("display",
          (toggle_minion.checked) ? "table-row" : "none");
  sessionStorage.setItem("show_minion", Number(toggle_minion.checked));
}

/* NOTE: This data does not appear to come from the Lodestone, but rather is
 * hardcoded on xivapi, so we're hardcoding it, too. */
var server_data = {
    "Aether": [
          "Adamantoise",
          "Cactuar",
          "Faerie",
          "Gilgamesh",
          "Jenova",
          "Midgardsormr",
          "Sargatanas",
          "Siren"
        ],
    "Chaos": [
          "Cerberus",
          "Louisoix",
          "Moogle",
          "Omega",
          "Phantom",
          "Ragnarok",
          "Sagittarius",
          "Spriggan"
        ],
    "Crystal": [
          "Balmung",
          "Brynhildr",
          "Coeurl",
          "Diabolos",
          "Goblin",
          "Malboro",
          "Mateus",
          "Zalera"
        ],
    "Dynamis": [
          "Halicarnassus",
          "Maduin",
          "Marilith",
          "Seraph"
        ],
    "Elemental": [
          "Aegis",
          "Atomos",
          "Carbuncle",
          "Garuda",
          "Gungnir",
          "Kujata",
          "Tonberry",
          "Typhon"
        ],
    "Gaia": [
          "Alexander",
          "Bahamut",
          "Durandal",
          "Fenrir",
          "Ifrit",
          "Ridill",
          "Tiamat",
          "Ultima"
        ],
    "Korea": [
          "초코보",
          "모그리",
          "카벙클",
          "톤베리",
          "펜리르"
        ],
    "Light": [
          "Alpha",
          "Lich",
          "Odin",
          "Phoenix",
          "Raiden",
          "Shiva",
          "Twintania",
          "Zodiark"
        ],
    "Mana": [
          "Anima",
          "Asura",
          "Chocobo",
          "Hades",
          "Ixion",
          "Masamune",
          "Pandaemonium",
          "Titan"
        ],
    "Materia": [
          "Bismarck",
          "Ravana",
          "Sephirot",
          "Sophia",
          "Zurvan"
        ],
    "Meteor": [
          "Belias",
          "Mandragora",
          "Ramuh",
          "Shinryu",
          "Unicorn",
          "Valefor",
          "Yojimbo",
          "Zeromus"
        ],
    "Primal": [
          "Behemoth",
          "Excalibur",
          "Exodus",
          "Famfrit",
          "Hyperion",
          "Lamia",
          "Leviathan",
          "Ultros"
        ],
    "猫小胖": [
          "ZiShuiZhanQiao",
          "YanXia",
          "JingYuZhuangYuan",
          "MoDuNa",
          "HaiMaoChaWu",
          "RouFengHaiWan",
          "HuPoYuan"
        ],
    "莫古力": [
          "BaiYinXiang",
          "BaiJinHuanXiang",
          "ShenQuanHen",
          "ChaoFengTing",
          "LvRenZhanQiao",
          "FuXiaoZhiJian",
          "Longchaoshendian",
          "MengYuBaoJing"
        ],
    "豆豆柴": [
          "ShuiJingTa2",
          "YinLeiHu2",
          "TaiYangHaiAn2",
          "YiXiuJiaDe2",
          "HongChaChuan2"
        ],
    "陆行鸟": [
          "HongYuHai",
          "ShenYiZhiDi",
          "LaNuoXiYa",
          "HuanYingQunDao",
          "MengYaChi",
          "YuZhouHeYin",
          "WoXianXiRan",
          "ChenXiWangZuo"
        ]
};

function updateApplyButton() {
  if (select_datacenter.selectedIndex < 0
    || select_server.selectedIndex < 0
    || !input_fcname.value.trim().length
  ) {
    button_apply.disabled = true;
    button_copy_link.disabled = true;
  } else {
    button_apply.disabled = false;
    button_copy_link.disabled = false;
  }
}

function loadServerData() {
  updateStatus();
  showSettings();
}

/* Source: https://developer.mozilla.org/en-US/docs/Web/API/Node */
function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function loadSettings() {
  datacenter = url.searchParams.get("datacenter") ||
    localStorage.getItem("datacenter");
  server = url.searchParams.get("server") ||
    localStorage.getItem("server");
  fc_name = url.searchParams.get("fcname") ||
    localStorage.getItem("fcname");
  fc_id = url.searchParams.get("fcid") ||
    localStorage.getItem("fcid");
  excluded_ranks = url.searchParams.get("excludedranks") ||
    localStorage.getItem("excludedranks");
  /* Make sure the settings are stored. */
  storeSettings();
}

function showSettings() {
  var option;
  loadSettings();
  removeAllChildren(select_datacenter);
  for (var dc of Object.keys(server_data)) {
    option = document.createElement("option");
    option.textContent = option.value = dc;
    select_datacenter.appendChild(option);
  }
  if (datacenter) {
    select_datacenter.selectedIndex = datacenter;
    datacenterSet();
  } else {
    select_datacenter.selectedIndex = -1;
    select_server.disabled = true;
  }

  settings_ui.style.display = "table";
  updateApplyButton();
}

function datacenterSet() {
  var option;
  removeAllChildren(select_server);
  for (var [key, value] of Object.entries(
    server_data[select_datacenter.value])) {
    option = document.createElement("option");
    option.value = key;
    option.textContent = value;
    select_server.appendChild(option);
  }
  if (datacenter != select_datacenter.selectedIndex) {
    select_server.selectedIndex = -1;
    input_fcname.value = "";
    input_excluded_ranks.value = "";
  } else {
    if (server) {
      select_server.selectedIndex = server;
      input_fcname.value = fc_name;
      input_excluded_ranks.value = excluded_ranks;
    } else {
      select_server.selectedIndex = -1;
      input_fcname.value = "";
      input_excluded_ranks.value = "";
    }
  }
  select_server.disabled = false;
  updateApplyButton();
}

function storeSettings() {
  /* Store settings in local storage.
   * NOTE: datacenter is a number, server is a number, fcname a string,
   * fcid a number, excludedranks a string. */
  if (datacenter > -1) localStorage.setItem("datacenter", datacenter);
  if (server > -1) localStorage.setItem("server", server);
  if (fc_name) localStorage.setItem("fcname", fc_name);
  if (excluded_ranks) localStorage.setItem("excludedranks", excluded_ranks);
  if (fc_id) localStorage.setItem("fcid", fc_id);
}

function applySettings() {
  settings_ui.style.display = "none";
  if (
    datacenter != select_datacenter.selectedIndex
    || server != select_server.selectedIndex
    || fc_name != input_fcname.value
    || excluded_ranks != input_excluded_ranks.value
  ) {
    datacenter = select_datacenter.selectedIndex;
    server = select_server.selectedIndex;
    fc_name = input_fcname.value;
    excluded_ranks = input_excluded_ranks.value;
    var sname = server_data[select_datacenter.value][select_server.value];
    updateStatus("Loading FC ID ...");
    window.fetch(api + "id&" + `name=${fc_name}&world=${sname}`).then(
        (response) => response.json().then(
          (data) => {
            fc_id = data;
            storeSettings();
            loadFCMembers();
          }
        ),
        (error) => {
          updateStatus("Error determining ID :(");
        }
      );
  }
}

/* === MAIN =========================================================== */

/* TODO:
 */

select_datacenter.addEventListener("change", datacenterSet);
select_server.addEventListener("change", updateApplyButton);
input_fcname.addEventListener("change", updateApplyButton);
button_settings.addEventListener("click", loadServerData);
button_cancel.addEventListener("click", () => {
  settings_ui.style.display = "none";
});
button_apply.addEventListener("click", applySettings);
button_copy_link.addEventListener("click", function () {
  var url2 = new URL(url);
  url2.search = ""; /* Clear any values, if present. */
  url2.searchParams.set("fcid", fc_id);
  url2.searchParams.set("datacenter", datacenter);
  url2.searchParams.set("server", server);
  url2.searchParams.set("fcname", fc_name);
  url2.searchParams.set("excludedranks", excluded_ranks);
  navigator.clipboard.writeText(url2.href);
});

var tomselect = new TomSelect("#searchselect", {
  plugins: ["remove_button"],
  onItemAdd: function(value, $item){
    this.setTextboxValue("");
    this.blur();
    sessionStorage.setItem(
      "character_selection", JSON.stringify(this.getValue()));
    loadMounts(value);
  },
  onItemRemove: function(value){
    if (this.getValue().length) {
      sessionStorage.setItem(
        "character_selection", JSON.stringify(this.getValue()));
    } else {
      sessionStorage.removeItem("character_selection");
    }
    removeCharacter(value);
  },
});
tomselect.disable();
hide_complete.disabled = true;
select_expansion.disabled = true;
toggle_savage.disabled = true;
toggle_minion.disabled = true;

hide_complete.addEventListener("change", set_hide_complete);
hide_complete.selectedIndex = sessionStorage.getItem("hide_complete") || 0;

select_expansion.addEventListener("change", set_hide_expansions);
select_expansion.selectedIndex =
  sessionStorage.getItem("hide_expansions") || 0;

toggle_savage.addEventListener("change", set_hide_savage);
toggle_savage.checked = Number(sessionStorage.getItem("show_savage"));
toggle_minion.addEventListener("change", set_hide_minion);
toggle_minion.checked = Number(sessionStorage.getItem("show_minion"));

/* Local overrides. */
var overrides = JSON.parse(sessionStorage.getItem("overrides")) || {};

/* Populate table, mounts, and overrides. */
for (var mount_name of Object.keys(mounts)) {
  var tr = document.createElement("tr");
  tr.classList.add(mounts[mount_name].expansion);
  tr.classList.add(mounts[mount_name].type);
  mounts_table_body.appendChild(tr);
  var th = document.createElement("th");
  tr.appendChild(th);
  var icon = (mounts[mount_name].type == "savage") ? savageIcon : (
    (mounts[mount_name].type == "minion") ? minionIcon : "" );
  th.innerHTML = mount_name + "<span> " + icon + "</span>" + "<div>" +
    mounts[mount_name].quest +
    ((mounts[mount_name].boss) ? ("<br/><em>" + mounts[mount_name].boss +
      "</em>") : "") + "</div>";
  mounts[mount_name].tr = tr;
  if (!overrides.hasOwnProperty(mount_name)) {
    overrides[mount_name] = [];
  }
}

loadSettings();
if (fc_id) {
  loadFCMembers();
} else {
  /* No id set, so show settings to start with. */
  loadServerData();
}
