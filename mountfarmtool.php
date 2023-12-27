<?php

const BASEURL = "https://na.finalfantasyxiv.com/lodestone/";
const FCID =    BASEURL . "freecompany/?q=<name>&worldname=<server>";
const FCID_TOKENS = ["<name>", "<server>"];
const FCMEMBERS = BASEURL . "freecompany/<id>/member";
const FCMEMBERS_TOKEN = "<id>";
const MOUNTS = BASEURL . "character/<id>/mount";
const MOUNTS_TOKEN = "<id>";
const MINIONS = BASEURL . "character/<id>/minion";
const MINIONS_TOKEN = "<id>";
const ACHIEVEMENTS = BASEURL . "character/<id>/achievement";
const ACHIEVEMENTS_TOKEN = "<id>";
//NOTE: Use string replacement (more secure) to fill in placeholders.

//------------------------------------------------------------------------------

function get_data($url, $mobile = false) {
    $ch = curl_init();
    $timeout = 5;
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
    if ($mobile) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)" .
            " AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3" .
            " Mobile/15E148 Safari/604.1"));
    }
    $data = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    return [ "data" => $data, "code" => $code ];
}

function getElementsByTagAndClass($xpath, $tag, $class, $context = null) {
    $query = ($context ? "." : "") .
        "//" . $tag .  "[contains(concat(' ', normalize-space(@class), ' '), ' " .
        $class . " ')]";
    /*
    error_log($query);
    error_log($xpath->query($query, $context)->length);
    //*/
    return $xpath->query($query, $context);
}

//------------------------------------------------------------------------------

/* Get the ID of a Free Company given a name and world.  This will return the
 * exact match, or the first if only partual matches were found.
 */
function getFCID($name, $world) {
    $endpoint = str_replace(FCID_TOKENS, [$name, $world], FCID);
    $result = get_data($endpoint);
    if ($result["code"] != 200) {
        // Error handling.
        return "ERROR " . $result["code"] . " - Lodestone error.";
    } else {
        $doc = new DomDocument();
        @$doc->loadHTML($result["data"]);
        $xpath = new DOMXpath($doc);
        $anchor = getElementsByTagAndClass($xpath, "a", "entry__block")[0];
        return explode("/", $anchor->getAttribute("href"))[3];
    }
}

/* Get the members of a Free Company as array of associative arrays with "id"
 * and "name".
 */
function getMembers($fcid) {
    $members = array();
    $endpoint = str_replace(FCMEMBERS_TOKEN, $fcid, FCMEMBERS);
    do {
        $result = get_data($endpoint);
        if ($result["code"] != 200) {
            // Error handling.
            return "ERROR " . $result["code"] . " - Lodestone error.";
        } else {
            $doc = new DomDocument();
            @$doc->loadHTML($result["data"]);
            $xpath = new DOMXpath($doc);
            $memberentries = getElementsByTagAndClass($xpath, "a", "entry__bg");
            foreach ($memberentries as $entry) {
                $membername = getElementsByTagAndClass(
                    $xpath, "p", "entry__name", $entry)[0];
                $memberrank = $xpath->query(".//span", $entry)[0];
                $members[] = [
                    "id" => explode("/", $entry->getAttribute("href"))[3],
                    "name" => $membername->nodeValue,
                    "rank" => $memberrank->nodeValue,
                ];
            }
            $next = getElementsByTagAndClass($xpath, "a", "btn__pager__next")[0];
            $endpoint = $next->getAttribute("href");
            if ($endpoint == "javascript:void(0);") {
                $endpoint = "";
            }
        }
    } while ($endpoint);
    return $members;
}

/* Get the achievements of a given character as array of associative arrays
 * with "name" and "type".
 */
function getAchievements($id) {
    $achievements = array();
    $endpoint = str_replace(ACHIEVEMENTS_TOKEN, $id, ACHIEVEMENTS);
    do {
        $result = get_data($endpoint);
        if ($result["code"] != 200) {
            // Error handling.
            return "ERROR " . $result["code"] . " - Lodestone error.";
        } else {
            $doc = new DomDocument();
            @$doc->loadHTML($result["data"]);
            $xpath = new DOMXpath($doc);
            $achievemententries = getElementsByTagAndClass(
                $xpath, "p", "entry__activity__txt");
            foreach ($achievemententries as $entry) {
                $pieces = explode('"', $entry->nodeValue);
                $achievements[] = [
                    "name" => $pieces[1],
                    "type" => str_replace(" achievement ", "", $pieces[0]),
                ];
            }
            $next = getElementsByTagAndClass($xpath, "a", "btn__pager__next")[0];
            $endpoint = $next->getAttribute("href");
            if ($endpoint == "javascript:void(0);") {
                $endpoint = "";
            }
        }
    } while ($endpoint);
    return $achievements;
}

/* Get the mounts of a given character.
 */
function getMounts($id) {
    $mounts = array();
    $endpoint = str_replace(MOUNTS_TOKEN, $id, MOUNTS);
    $result = get_data($endpoint, true);
    if ($result["code"] != 200) {
        // Error handling.
        return "ERROR " . $result["code"] . " - Lodestone error.";
    } else {
        $doc = new DomDocument();
        @$doc->loadHTML($result["data"]);
        $xpath = new DOMXpath($doc);
        $mountentries = getElementsByTagAndClass($xpath, "span", "mount__name");
        foreach ($mountentries as $entry) {
            $mounts[] = $entry->nodeValue;
        }
        return $mounts;
    }
}

/* Get the minions of a given character.
 */
function getMinions($id) {
    $minions = array();
    $endpoint = str_replace(MINIONS_TOKEN, $id, MINIONS);
    $result = get_data($endpoint, true);
    if ($result["code"] != 200) {
        // Error handling.
        return "ERROR " . $result["code"] . " - Lodestone error.";
    } else {
        $doc = new DomDocument();
        @$doc->loadHTML($result["data"]);
        $xpath = new DOMXpath($doc);
        $minionentries = getElementsByTagAndClass($xpath, "span", "minion__name");
        foreach ($minionentries as $entry) {
            $minions[] = $entry->nodeValue;
        }
        return $minions;
    }
}

//==============================================================================

// Returned data (will be serialised using JSON).
$data = null;
//
// Process URL parameters.
// Options:
//   get FC id           → ?op=id&name=Mistwalkers&world=Bismarck
//   get FC members      → ?op=me&id=9226468261598593545
//   get PC mounts       → ?op=mo&id=9347267
//   get PC minions      → ?op=mi&id=9347267
//   get PC achievements → ?op=ac&id=9347267
switch ($_GET["op"]) {
case "id":
    $data = getFCID($_GET["name"], $_GET["world"]);
    break;
case "me":
    $data = getMembers($_GET["id"]);
    break;
case "mo":
    $data = getMounts($_GET["id"]);
    break;
case "mi":
    $data = getMinions($_GET["id"]);
    break;
case "ac":
    $data = getAchievements($_GET["id"]);
    break;
default:
    // Return error code 422: Unprocessable Content.
    $data = "ERROR 422 - Invalid operation '" . $_GET["op"] . "'.";
    error_log($data);
    http_response_code(422);
}

$json = json_encode($data);
if ($json === false) {
    // Avoid echo of empty string (which is invalid JSON), and
    // JSONify the error message instead:
    $json = json_encode(["jsonError" => json_last_error_msg()]);
    if ($json === false) {
        // This should not happen, but we go all the way now:
        $json = '{"jsonError":"unknown"}';
    }
    // Set HTTP response status code to: 500 - Internal Server Error
    http_response_code(500);
}
header("Content-Type: application/json");
echo $json;
?>
