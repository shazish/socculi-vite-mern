<?php
define( 'WP_CACHE', false ); // By Speed Optimizer by SiteGround

/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * Localized language
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'dbmaxuh8xkkwrf' );

/** Database username */
define( 'DB_USER', 'upjo7kdurpb8f' );

/** Database password */
define( 'DB_PASSWORD', 'ge7wfa9in8e4' );

/** Database hostname */
define( 'DB_HOST', '127.0.0.1' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',          '?GshB1^8)&F_snb>$yHah&n^PeyzQ:I GKAC-K;B P7K}),bMGZv+Nr-61y;0;+M' );
define( 'SECURE_AUTH_KEY',   '&gcCk%a*+xKUO1?Yf/>p8G5I;vIk_6IP:kx4zKL_P5p<Nmb{|Sm)MG}+,L?61dA)' );
define( 'LOGGED_IN_KEY',     'I-!-$t45QH%N/:=Xny|YE(a,m^C5-31~OL{<qS6B+Y8~oSaU3-_WU}QejZ^w7D@s' );
define( 'NONCE_KEY',         '.PCu3lv.>*dq^RAl~4Gm6J`A`rZOVuRYhHc%]t@WYajk@?>4[JOGx^-_zW-h f&.' );
define( 'AUTH_SALT',         '-(mWnnuVXP)cl1pZSH@(b3)(9]c&7&TkY7djHD(62sE4v/oRg^wd2CiNsAxfQAyw' );
define( 'SECURE_AUTH_SALT',  '?_rp+>D3dv16g3YHm1,UEZG5rxheWaQ`EjqxnlL. /)+f]MeZ@bwwelPM;J013ZV' );
define( 'LOGGED_IN_SALT',    '9GlMxULrpD/>V90cy73=:_ZG!ChQ|i^r=7tygi3X]{pxnDj*GuZ,8%@w6ZTS,ziF' );
define( 'NONCE_SALT',        ']Yo_4$}h4VSq15$Hb%h9[k6VjTPaX8Z)wf=?`MJ,yAg{+bT g;[MojtP7_SB@YH<' );
define( 'WP_CACHE_KEY_SALT', '_fCs!H@$b%F7a84pMknMM1JD0h1V FJMj;noNX?Wxw+|R+`>~fK|%%BaQnVjSwQ0' );

// ADD THESE DEBUG SETTINGS
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false );
define( 'SCRIPT_DEBUG', true );


/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'qcq_';


/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
@include_once('/var/lib/sec/wp-settings-pre.php'); // Added by SiteGround WordPress management system
require_once ABSPATH . 'wp-settings.php';
@include_once('/var/lib/sec/wp-settings.php'); // Added by SiteGround WordPress management system
