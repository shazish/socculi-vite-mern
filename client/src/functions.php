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
function current_matchday_endpoint()
{
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

	$day = isset($_POST['day']) ? sanitize_text_field($_POST['day']) : '';

	$url = 'https://api.football-data.org/v4/competitions/PL/matches?matchday=' . $day;

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
		match_id INT NOT NULL,
		week_id INT NOT NULL,
		home_team VARCHAR(100) NOT NULL,
		away_team VARCHAR(100) NOT NULL,
		home_score_prediction INT,
		away_score_prediction INT,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

	require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
	dbDelta($sql);
}

add_action('wp_ajax_create_submissions_table', 'create_submissions_table');
add_action('wp_ajax_nopriv_create_submissions_table', 'create_submissions_table');

function submit_user_predictions() {
	error_log('submit_user_predictions POST Data: ' . var_export($_POST, true));
}
add_action('wp_ajax_submit_user_predictions', 'submit_user_predictions');
add_action('wp_ajax_nopriv_submit_user_predictions', 'submit_user_predictions');

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

// Replace page content
// function replace_page_content($content) {
// 	$content = '<div id="root"></div>';

//     return $content;
// }
// add_action('template_redirect', 'replace_page_content');