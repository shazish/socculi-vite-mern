<?php
/*
Plugin Name: Succuli backend handler
Description: Backend logic for custom functionality
Version: 1.0
Author: Shazi
*/


// Prevent direct access to the plugin
if (!defined('ABSPATH')) {
    exit;
}

add_action('init', 'plugin_init');

function plugin_init() {
	// echo plugin_dir_url(__FILE__);
}

// create an endpoint for react to access
function current_matchday_endpoint() {
	$headers = array(
		'X-Auth-Token' => 'b4ae459ba6da4b6887a47d5788c64c88'
	);

	$args = array(
		'headers' => $headers
	);

	$url = 'https://api.football-data.org/v4/competitions/PL';
	$response = wp_remote_get($url, $args);

	error_log(' >> ' . $response);

	if (is_array($response) && !is_wp_error($response)) {
		$body = wp_remote_retrieve_body($response);
		$data = json_decode($body);
		wp_send_json($data);
	} else {
		wp_send_json_error('Error fetching data');
	}
	wp_die();
}
add_action('wp_ajax_current_matchday_endpoint', 'current_matchday_endpoint');
add_action('wp_ajax_nopriv_current_matchday_endpoint', 'current_matchday_endpoint');


function get_matchday_games()
{
	$headers = array('X-Auth-Token' => 'b4ae459ba6da4b6887a47d5788c64c88');
	$args = array('headers' => $headers);
	error_log('POST Data: ' . var_export($_POST, true));

	// $day = isset($_POST['day']) ? sanitize_text_field($_POST['day']) : '';

	// $url = 'https://api.football-data.org/v4/competitions/PL/matches?matchday=' . $day;

	$url = 'https://api.football-data.org/v4/competitions/PL/matches';

	error_log(' >>>> ' . $url);

	$response = wp_remote_get($url, $args);

	if (is_array($response) && !is_wp_error($response)) {
		$body = wp_remote_retrieve_body($response);
		$data = json_decode($body);
		wp_send_json($data);
	} else {
		wp_send_json_error('Error fetching data');
	}
	wp_die();
}
add_action('wp_ajax_get_matchday_games', 'get_matchday_games');
add_action('wp_ajax_nopriv_get_matchday_games', 'get_matchday_games');


// Create custom table on plugin activation
function create_submissions_table()
{
	global $wpdb;
	// $wpdb->select('sql4sicculi');
	// $different_db = new wpdb('sql4sicculi', 'Sickuel!', 'sql4sicculi', 'mysql.shaziblues.io');
	$table_name = $wpdb->prefix . 'user_submissions';
	$charset_collate = $wpdb->get_charset_collate();

	$sql = "CREATE TABLE IF NOT EXISTS $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
		user_id INT NOT NULL,
		week_id INT NOT NULL,
		predictions TEXT NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

	require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
	dbDelta($sql);
	dbDelta($sql2);
}
add_action('wp_ajax_create_submissions_table', 'create_submissions_table');
add_action('wp_ajax_nopriv_create_submissions_table', 'create_submissions_table');


function submit_user_predictions() {
	error_log('submit_user_predictions POST Data: ' . var_export($_POST, true));
    global $wpdb;
    $table_name = $wpdb->prefix . 'user_submissions';
    
    // $result = $wpdb->insert(
    //     $table_name,
    //     array(
    //         'user_id' => isset($_POST['userId']) ? intval(sanitize_text_field($_POST['userId'])) : '',
    //         'week_id' => isset($_POST['matchDay']) ? intval(sanitize_text_field($_POST['matchDay'])) : '',
    //         'predictions' => isset($_POST['dataStr']) ? sanitize_text_field($_POST['dataStr']) : '',
    //     ),
    //     array(
    //         '%d',  // user_id format (integer)
    //         '%d',  // week_id format (integer)
    //         '%s'   // predictions format (string)
    //     )
    // );

	// works for both insertions and updates
	$result = $wpdb->query(
		$wpdb->prepare(
			"INSERT INTO $table_name (user_id, week_id, predictions) 
			 VALUES (%d, %d, %s) 
			 ON DUPLICATE KEY UPDATE predictions = VALUES(predictions)",
			isset($_POST['userId']) ? intval(sanitize_text_field($_POST['userId'])) : 0,
			isset($_POST['matchDay']) ? intval(sanitize_text_field($_POST['matchDay'])) : 0,
			isset($_POST['dataStr']) ? sanitize_text_field($_POST['dataStr']) : ''
		)
	);

    // Check if insertion was unsuccessful
    if ($result === false) {
		error_log('submit_user_predictions Error: ' . $wpdb->last_error);
        return false;
    }
    
    // Return the ID of the newly inserted record
	error_log('submit_user_predictions ID: ' . $wpdb->insert_id);
    return $wpdb->insert_id;
}
add_action('wp_ajax_submit_user_predictions', 'submit_user_predictions');
add_action('wp_ajax_nopriv_submit_user_predictions', 'submit_user_predictions');


// Get user submission for a specific week
function get_user_week_submission() {

	$user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
    $week_id = isset($_POST['week_id']) ? intval($_POST['week_id']) : 0;

    global $wpdb;
    $table_name = $wpdb->prefix . 'user_submissions';
    
    // Sanitize and validate inputs
    $user_id = intval(sanitize_text_field($user_id));
    $week_id = intval(sanitize_text_field($week_id));
    
	error_log('get_user_week_submission: user_id: ' . $user_id . ' week_id: ' . $week_id);

    if ($user_id < 0 || $week_id <= 0) {
        return false;
    }
    
    // Fetch specific week submission
    $query = $wpdb->prepare(
        "SELECT * FROM $table_name WHERE user_id = %d AND week_id = %d LIMIT 1",
        $user_id,
        $week_id
    );
    
    $result = $wpdb->get_row($query);
	error_log('get_user_week_submission: result' . var_export($result, true));
    
	if ($result) {
        wp_send_json_success($result);
    } else {
        wp_send_json_error('get_user_week_submission: No data found');
    }
    
    wp_die();
}
add_action('wp_ajax_get_user_week_submission', 'get_user_week_submission');
add_action('wp_ajax_nopriv_get_user_week_submission', 'get_user_week_submission');

// inject react app
function enqueue_react_app()
{
	wp_enqueue_script(
		'react-app',
		plugin_dir_url(__FILE__) . 'index.js',
		array(),
		null,
		true
	);
	wp_enqueue_style(
		'react-app',
		plugin_dir_url(__FILE__) . 'index.css',
		null
	);
	// Make sure the root div is available. No more dealing with "incorrect mime type" error with this approach.
	echo '<div id="root" class="bleh"></div>';
}
add_action('wp_enqueue_scripts', 'enqueue_react_app');