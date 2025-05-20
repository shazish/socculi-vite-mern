import { test, expect } from '@playwright/test';
import mockMatchData from './mocks/matchData.json' assert { type: 'json' }; // Add assert { type: 'json' }
import { readFileSync } from 'fs';
import { join } from 'path';

// Read mock data
// const mockMatchData = JSON.parse(readFileSync(join(__dirname, './mocks/matchData.json'), 'utf-8'));

test.beforeEach(async ({ page }) => {

    // Mock API calls
    await page.route('**/wp-admin/admin-ajax.php?action=get_matchday_games', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockMatchData),
        });
    });

    await page.route('**/wp-admin/admin-ajax.php?action=create_submissions_table', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true }),
        });
    });

    await page.route('**/wp-admin/admin-ajax.php?action=submit_user_predictions', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true }),
        });
    });

    await page.route('**/wp-admin/admin-ajax.php?action=get_user_submissions*', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                predictions: 'home-input-0=2&away-input-0=1&timestamp-0=1625097600000&impact-0=1',
            }),
        });
    });

    // Navigate to the app
    await page.goto('/', { waitUntil: 'networkidle' });
    // Mock localStorage for user email
    await page.evaluate((email) => {
        localStorage.setItem('socculi_user_email', email);
    }, 'test@example.com');
});

test.describe('App Component', () => {
    test('should render Socculi branding', async ({ page }) => {
        await expect(page.locator('img[alt="Socculi logo"]')).toBeVisible();
        await expect(page.locator('h1', { hasText: 'Socculi' })).toBeVisible();
        await expect(page.locator('h3', { hasText: 'Second Half Fantasy League' })).toBeVisible();
    });

    test('should display loading animation initially', async ({ page }) => {
        await page.route('**/wp-admin/admin-ajax.php?action=get_matchday_games', async (route) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockMatchData),
            });
        });

        await page.goto('/');
        await expect(page.locator('img[alt="Animation logo"]')).toBeVisible();
    });
});

test.describe('MatchListRender Component', () => {
    test('should render match list with correct number of matches', async ({ page }) => {
        await expect(page.locator('[data-testid="match-list"]')).toHaveCount(mockMatchData.data.matches.length);
        const firstMatch = page.locator('[data-testid="match-line"]').first();
        await expect(firstMatch).toContainText('Team A');
        await expect(firstMatch).toContainText('Team B');
    });

    test('should allow entering and submitting predictions', async ({ page }) => {
        // Mock open submission deadline
        const openMatchData = {
            matches: [
                {
                    id: 1,
                    matchday: 27,
                    homeTeam: { name: 'Team A' },
                    awayTeam: { name: 'Team B' },
                    season: { currentMatchday: 27 },
                    status: 'SCHEDULED',
                    utcDate: new Date(Date.now() + 3600000).toISOString(),
                    score: { fullTime: { home: null, away: null } },
                },
            ],
        };
        await page.route('**/wp-admin/admin-ajax.php?action=get_matchday_games', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(openMatchData),
            });
        });

        await page.goto('/', { waitUntil: 'networkidle' });

        // Enter predictions
        await page.locator('input[name="home-input-0"]').fill('2');
        await page.locator('input[name="away-input-0"]').fill('1');

        // Submit form
        await page.locator('button', { hasText: 'Submit Predictions' }).click();

        // Check success toast
        await expect(page.locator('.Toastify__toast--success', { hasText: 'Predictions submitted successfully' })).toBeVisible();
    });

    test('should show error toast on failed submission', async ({ page }) => {
        // Mock open submission deadline
        const openMatchData = {
            matches: [
                {
                    id: 1,
                    matchday: 27,
                    homeTeam: { name: 'Team A' },
                    awayTeam: { name: 'Team B' },
                    season: { currentMatchday: 27 },
                    status: 'SCHEDULED',
                    utcDate: new Date(Date.now() + 3600000).toISOString(),
                    score: { fullTime: { home: null, away: null } },
                },
            ],
        };
        await page.route('**/wp-admin/admin-ajax.php?action=get_matchday_games', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(openMatchData),
            });
        });

        // Mock failed submission
        await page.route('**/wp-admin/admin-ajax.php?action=submit_user_predictions', async (route) => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Submission failed' }),
            });
        });

        await page.goto('/', { waitUntil: 'networkidle' });

        // Enter predictions
        await page.locator('input[name="home-input-0"]').fill('2');
        await page.locator('input[name="away-input-0"]').fill('1');

        // Submit form
        await page.locator('button', { hasText: 'Submit Predictions' }).click();

        // Check error toast
        await expect(page.locator('.Toastify__toast--error', { hasText: 'Error occured while submitting predictions' })).toBeVisible();
    });

    test('should display total score when matches are finished', async ({ page }) => {
        // Mock finished matches
        const finishedMatchData = {
            matches: [
                {
                    id: 1,
                    matchday: 27,
                    homeTeam: { name: 'Team A' },
                    awayTeam: { name: 'Team B' },
                    season: { currentMatchday: 27 },
                    status: 'FINISHED',
                    utcDate: new Date(Date.now() - 3600000).toISOString(),
                    score: { fullTime: { home: 2, away: 1 } },
                },
            ],
        };
        await page.route('**/wp-admin/admin-ajax.php?action=get_matchday_games', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(finishedMatchData),
            });
        });

        await page.goto('/', { waitUntil: 'networkidle' });

        // Check total score
        await expect(page.locator('text=Your Total Score')).toBeVisible();
        await expect(page.locator('text=/\d+\.\d/')).toBeVisible(); // Dynamic score
    });

    test('should show VSOP link when matches are finished', async ({ page }) => {
        // Mock finished matches
        const finishedMatchData = {
            matches: [
                {
                    id: 1,
                    matchday: 27,
                    homeTeam: { name: 'Team A' },
                    awayTeam: { name: 'Team B' },
                    season: { currentMatchday: 27 },
                    status: 'FINISHED',
                    utcDate: new Date(Date.now() - 3600000).toISOString(),
                    score: { fullTime: { home: 2, away: 1 } },
                },
            ],
        };
        await page.route('**/wp-admin/admin-ajax.php?action=get_matchday_games', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(finishedMatchData),
            });
        });

        await page.goto('/', { waitUntil: 'networkidle' });

        // Check VSOP link
        await expect(page.locator('a[href="/vsop"]', { hasText: /See how you performed compared to OP on Week 27/ })).toBeVisible();
    });

    test('should display OP and user predictions in VSOP mode', async ({ page }) => {
        // Mock finished matches for VSOP
        const finishedMatchData = {
            matches: [
                {
                    id: 1,
                    matchday: 27,
                    homeTeam: { name: 'Team A' },
                    awayTeam: { name: 'Team B' },
                    season: { currentMatchday: 27 },
                    status: 'FINISHED',
                    utcDate: new Date(Date.now() - 3600000).toISOString(),
                    score: { fullTime: { home: 2, away: 1 } },
                },
            ],
        };
        await page.route('**/wp-admin/admin-ajax.php?action=get_matchday_games', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(finishedMatchData),
            });
        });

        await page.goto('/?vsop=true', { waitUntil: 'networkidle' });

        // Check OP and user prediction headers
        await expect(page.locator('text=OP Predictions')).toBeVisible();
        await expect(page.locator('text=Your Predictions')).toBeVisible();

        // Check scores
        await expect(page.locator('text=OP Total')).toBeVisible();
        await expect(page.locator('text=Your Total')).toBeVisible();
    });
});