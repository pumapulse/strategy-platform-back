// Seed sample community discussions
// Run with: node seed-discussions.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ── Sample data ────────────────────────────────────────────────────────────────

const seedUsers = [
  { name: 'Alex Rivera',   email: 'alex.rivera@seed.com',   password: 'Seed1234!' },
  { name: 'Mia Chen',      email: 'mia.chen@seed.com',      password: 'Seed1234!' },
  { name: 'James Okafor',  email: 'james.okafor@seed.com',  password: 'Seed1234!' },
  { name: 'Sofia Müller',  email: 'sofia.muller@seed.com',  password: 'Seed1234!' },
  { name: 'Liam Park',     email: 'liam.park@seed.com',     password: 'Seed1234!' },
];

const discussions = [
  {
    authorIndex: 0,
    title: 'How I turned $5k into $23k using the Breakout Momentum strategy',
    category: 'Strategy',
    content: `Six months ago I started with $5,000 and applied the Breakout Momentum strategy exclusively on BTC/USDT 4H charts. Here's exactly what I did:

1. Waited for price to consolidate for at least 8 candles inside a tight range (ATR < 0.8%)
2. Entered on the first candle that closed above the range high with volume > 1.5× the 20-period average
3. Set stop-loss 1 ATR below the breakout candle low
4. Took 50% profit at 2R, moved stop to breakeven, let the rest run

Results over 47 trades:
- Win rate: 62%
- Average winner: +8.4%
- Average loser: -3.1%
- Max drawdown: -11.2%
- Final balance: $23,180

The key insight was patience — I skipped 3 out of every 4 setups that didn't meet all criteria. Quality over quantity.

Happy to answer questions about specific trade setups.`,
    likes: 87,
    views: 1240,
    replies: [
      { authorIndex: 1, content: 'This is incredible. Did you use any specific indicator for the volume confirmation, or just raw volume bars? I\'ve been struggling with false breakouts on lower timeframes.', likes: 14 },
      { authorIndex: 2, content: 'The 2R partial take-profit rule is underrated. Most traders either hold too long or exit too early. Moving stop to breakeven after 50% out removes all the emotional pressure.', likes: 22 },
      { authorIndex: 3, content: 'What was your position sizing? Fixed % of account or fixed dollar amount? That matters a lot for the drawdown calculation.', likes: 8 },
      { authorIndex: 0, content: '@Sofia — I used 2% risk per trade throughout. So position size varied based on the distance to stop-loss. Never risked more than 2% of current account balance on any single trade.', likes: 19 },
      { authorIndex: 4, content: 'Did you backtest this before going live? I\'m curious how the live results compare to the backtest numbers on the platform.', likes: 6 },
    ],
  },
  {
    authorIndex: 1,
    title: 'RSI Divergence — the most misunderstood signal in trading',
    category: 'Analysis',
    content: `After 3 years of trading I've come to believe RSI divergence is both the most powerful and most misused signal out there. Let me break down what actually works.

**What most traders get wrong:**
- They trade every divergence they see
- They ignore the trend context
- They enter immediately on divergence without confirmation

**What actually works:**

Regular Bearish Divergence (price makes higher high, RSI makes lower high):
✓ Only valid when RSI was previously overbought (>70)
✓ Must occur after a sustained uptrend (at least 20 candles)
✓ Wait for a bearish engulfing or close below the prior candle low before entering

Hidden Bullish Divergence (price makes higher low, RSI makes lower low):
✓ This is a TREND CONTINUATION signal, not reversal
✓ Most powerful in strong uptrends
✓ Best used on pullbacks to key support levels

**My personal rules:**
- Only trade divergences on 1H timeframe or higher
- Always check the higher timeframe trend first
- Use 14-period RSI, no changes
- Minimum 5 candles between the two pivot points

The ML Momentum strategy on this platform actually incorporates hidden divergence as one of its filters — that's part of why its win rate is so consistent.`,
    likes: 134,
    views: 2890,
    replies: [
      { authorIndex: 2, content: 'The hidden divergence point is gold. Most YouTube tutorials only teach regular divergence and wonder why their win rate is 40%. Hidden divergence in a trend is one of the highest probability setups I know.', likes: 31 },
      { authorIndex: 3, content: 'Do you apply this to crypto specifically or does it work equally well on forex and stocks? I\'ve noticed crypto tends to have more "fake" divergences due to the volatility.', likes: 12 },
      { authorIndex: 1, content: '@Sofia — Great question. Crypto does produce more noise. I add a volume filter for crypto: the divergence candle must have below-average volume (showing exhaustion), while the confirmation candle must have above-average volume. This cuts false signals by about 40%.', likes: 28 },
      { authorIndex: 4, content: 'What about divergence on the MACD histogram vs RSI? I\'ve seen some traders prefer MACD divergence. Any thoughts?', likes: 9 },
      { authorIndex: 0, content: 'MACD histogram divergence is valid but I find it triggers earlier (sometimes too early). RSI gives cleaner signals in my experience. I use MACD as a secondary confirmation only.', likes: 17 },
    ],
  },
  {
    authorIndex: 2,
    title: 'Position sizing: the one thing that separates profitable traders from everyone else',
    category: 'Risk Management',
    content: `I've mentored over 200 traders in the past 4 years. The single biggest difference between those who make money consistently and those who blow accounts is not strategy selection — it's position sizing.

**The Kelly Criterion (simplified):**
Optimal position size = (Win% × Avg Win) - (Loss% × Avg Loss) / Avg Win

For a strategy with 60% win rate, 2:1 reward/risk:
Kelly = (0.6 × 2) - (0.4 × 1) / 2 = 0.4 = 40% of account

But 40% is way too aggressive. Most professionals use "Half Kelly" or "Quarter Kelly":
- Half Kelly: 20% — still aggressive
- Quarter Kelly: 10% — reasonable for experienced traders
- I recommend: 1-3% for most retail traders

**Why fixed fractional (% of account) beats fixed dollar:**
- Your position size grows with your account (compounding)
- Your position size shrinks during drawdowns (automatic protection)
- Psychologically easier to follow rules

**The math of ruin:**
With 2% risk per trade and a 10-trade losing streak (which WILL happen):
Account remaining: 0.98^10 = 81.7% — you're still in the game

With 10% risk per trade and the same losing streak:
Account remaining: 0.90^10 = 34.9% — you're in serious trouble

Never risk more than you can afford to lose 10 times in a row.`,
    likes: 203,
    views: 4120,
    replies: [
      { authorIndex: 0, content: 'The Kelly Criterion explanation is the clearest I\'ve seen. Most people just say "risk 1-2%" without explaining the math behind it. This should be pinned.', likes: 45 },
      { authorIndex: 1, content: 'I\'d add one more thing: correlation risk. If you\'re running 3 crypto strategies simultaneously, they\'re all correlated. Your effective risk per "market event" is much higher than 2% × 3 = 6%.', likes: 38 },
      { authorIndex: 3, content: 'How do you handle position sizing when the stop-loss is very wide? Sometimes a proper technical stop requires 5-6% price movement, which means a tiny position size.', likes: 14 },
      { authorIndex: 2, content: '@Sofia — If the stop requires 5-6% price movement and you want to risk 2% of account, your position size is just 2/5 = 0.4% of account in the asset. Small position, but that\'s correct. Wide stops = small size. Never widen your stop to fit a larger position.', likes: 29 },
      { authorIndex: 4, content: 'This is why I love the strategies on this platform — they all come with defined max drawdown stats so you can calculate proper position sizing before you even start.', likes: 16 },
    ],
  },
  {
    authorIndex: 3,
    title: 'My 30-day automated trading experiment — full results and lessons',
    category: 'Automation',
    content: `I ran a 30-day live automated trading experiment using the VWAP Scalper strategy on ES futures (S&P 500). Here are the unfiltered results.

**Setup:**
- Capital: $10,000
- Strategy: VWAP Scalper (15m timeframe)
- Broker: Interactive Brokers
- Automation: Python script via IBKR API
- Risk per trade: 1.5%

**Month 1 Results:**
- Total trades: 89
- Winners: 54 (60.7%)
- Losers: 35 (39.3%)
- Gross P&L: +$1,847
- Commissions: -$312
- Net P&L: +$1,535 (+15.35%)
- Max drawdown: -$680 (-6.8%)
- Largest single loss: -$187
- Largest single win: +$312

**What went well:**
- Removed all emotional decision-making
- Executed every signal without hesitation
- Consistent position sizing throughout

**What went wrong:**
- Two days with connectivity issues caused missed trades
- One bug in my code caused a double-entry on day 14 (cost me $240)
- Slippage was higher than backtested during the first 30 minutes of market open

**Key lesson:**
The strategy itself performed close to backtest expectations. The problems were all infrastructure. If you're automating, spend 80% of your time on error handling, not the strategy logic.

Next month I'm adding circuit breakers: auto-pause if daily loss exceeds 3%.`,
    likes: 156,
    views: 3340,
    replies: [
      { authorIndex: 0, content: 'The double-entry bug is a classic. Always implement idempotency checks — if an order ID already exists, don\'t submit again. Saved me from a similar disaster.', likes: 27 },
      { authorIndex: 1, content: 'What was your slippage on average vs backtest assumption? This is the biggest hidden cost most people ignore when going from backtest to live.', likes: 19 },
      { authorIndex: 3, content: '@Mia — Backtest assumed 0.5 tick slippage. Live average was 1.2 ticks during normal hours, 2.8 ticks in the first 30 minutes. I now exclude the first 30 minutes from the strategy window.', likes: 34 },
      { authorIndex: 2, content: 'The circuit breaker idea is essential. I\'d also add a weekly circuit breaker. If you\'re down more than 5% on the week, pause until Monday. Prevents revenge trading by the algorithm.', likes: 41 },
      { authorIndex: 4, content: 'Are you sharing the Python code anywhere? I\'ve been trying to automate the Breakout Momentum strategy but struggling with the IBKR API.', likes: 22 },
    ],
  },
  {
    authorIndex: 4,
    title: 'Complete guide: reading order flow for better entries',
    category: 'Education',
    content: `Order flow analysis is what separates institutional traders from retail. Here's a beginner-friendly breakdown of the core concepts.

**What is order flow?**
Order flow shows you the actual buying and selling pressure in the market — not just price, but the volume behind each move. The two main tools are:

1. **Footprint Charts** — Show volume at each price level within a candle
2. **DOM (Depth of Market)** — Shows pending limit orders at each price level

**Key concepts:**

**Delta** = Buying volume - Selling volume
- Positive delta: more aggressive buyers
- Negative delta: more aggressive sellers
- Divergence between price and delta = potential reversal

**Point of Control (POC)**
The price level with the highest traded volume in a session. Price tends to gravitate back to POC — it acts like a magnet.

**Volume Imbalance**
When one side of the market (bid or ask) has significantly more volume than the other at a price level. These create "gaps" in the market that price often returns to fill.

**How I use it practically:**
1. Identify key support/resistance levels on the chart
2. Watch for absorption at those levels (large volume, small price movement)
3. Look for delta divergence as confirmation
4. Enter when price shows rejection with strong opposing delta

**Best free tools to start:**
- Bookmap (has a free tier)
- Sierra Chart (affordable)
- TradingView's Volume Profile (built-in)

This takes time to learn but once it clicks, you'll never look at a plain candlestick chart the same way.`,
    likes: 178,
    views: 5670,
    replies: [
      { authorIndex: 1, content: 'The delta divergence concept is what finally made order flow click for me. When price makes a new high but delta is negative, it means the move was driven by stop-hunting, not genuine buying. Reversal incoming.', likes: 52 },
      { authorIndex: 0, content: 'Bookmap is genuinely game-changing for futures trading. The heatmap shows you where the big limit orders are sitting — you can literally see the "walls" before price hits them.', likes: 33 },
      { authorIndex: 2, content: 'How applicable is this to crypto? The order books on crypto exchanges are notoriously spoofed. Does order flow analysis still work when large players can place and cancel orders instantly?', likes: 24 },
      { authorIndex: 4, content: '@James — Great point. Crypto order books are heavily spoofed. I focus on executed volume (footprint) rather than pending orders (DOM) for crypto. Executed volume can\'t be faked — it already happened.', likes: 47 },
      { authorIndex: 3, content: 'Would love a follow-up post on how to combine order flow with the strategies available on this platform. The Ichimoku Cloud strategy + order flow confirmation sounds like a powerful combo.', likes: 29 },
    ],
  },
  {
    authorIndex: 0,
    title: 'Crypto vs Forex vs Stocks — which market is best for algorithmic strategies?',
    category: 'Strategy',
    content: `After running algorithmic strategies across all three markets for 2 years, here's my honest comparison.

**Crypto:**
✓ 24/7 trading — no overnight gaps
✓ High volatility = larger moves
✓ Low barriers to entry, small account sizes work
✓ Trend-following strategies work exceptionally well
✗ High slippage on smaller coins
✗ Exchange risk (hacks, insolvency)
✗ Regulatory uncertainty
✗ Manipulation is common on lower cap coins

Best strategies: Breakout Momentum, Trend Following, ML Momentum

**Forex:**
✓ Highest liquidity in the world
✓ Very tight spreads on majors
✓ Mean reversion strategies work well
✓ Predictable session-based patterns
✗ Requires larger capital for meaningful returns
✗ Broker dependency (dealing desk issues)
✗ News events can cause instant 50-pip gaps

Best strategies: Mean Reversion RSI, VWAP Scalper, Carry Trade

**Stocks:**
✓ Fundamental catalysts create predictable moves
✓ Earnings plays are highly systematic
✓ ETF arbitrage opportunities
✗ Market hours only (9:30-4:00 EST)
✗ PDT rule limits accounts under $25k
✗ Higher commissions on some brokers

Best strategies: Breakout on earnings, Sector rotation, Momentum

**My recommendation:**
Start with crypto if you have under $10k — the 24/7 nature and volatility give you more learning opportunities per month. Move to forex once you have consistent results and want lower volatility. Add stocks for diversification.`,
    likes: 92,
    views: 2180,
    replies: [
      { authorIndex: 2, content: 'The PDT rule point for stocks is huge and often overlooked. Many beginners blow up trying to day trade stocks with a $5k account, not realizing they\'re limited to 3 round trips per week.', likes: 18 },
      { authorIndex: 1, content: 'I\'d add that crypto has the best data availability for backtesting. Most exchanges provide free tick data going back years. For forex, quality historical data often costs money.', likes: 24 },
      { authorIndex: 3, content: 'What about commodities? Gold and oil have interesting properties — they respond to macro events differently than equities and can provide good diversification for an algo portfolio.', likes: 11 },
      { authorIndex: 4, content: 'The 24/7 crypto point is a double-edged sword. Yes, more opportunities, but also more exposure. I set my crypto bots to pause during weekends when liquidity drops and manipulation spikes.', likes: 15 },
    ],
  },
  {
    authorIndex: 1,
    title: 'Why 90% of backtests are lying to you (and how to fix it)',
    category: 'Analysis',
    content: `I've reviewed hundreds of strategy backtests and the same mistakes appear over and over. Here's what inflates backtest results and how to get honest numbers.

**Mistake 1: Look-ahead bias**
Using data that wouldn't have been available at the time of the trade. Classic example: using the closing price of a candle to decide whether to enter on that same candle.

Fix: Always use the open of the NEXT candle as your entry price.

**Mistake 2: Survivorship bias**
Backtesting only on assets that still exist today. If you backtest a "buy all S&P 500 stocks" strategy, you're missing all the companies that went bankrupt and were removed from the index.

Fix: Use point-in-time data that includes delisted securities.

**Mistake 3: Overfitting**
Optimizing parameters until the backtest looks perfect. A strategy with 47 parameters tuned to historical data will fail in live trading.

Fix: Use walk-forward optimization. Train on 70% of data, test on the remaining 30%. Never touch the test set until you're done optimizing.

**Mistake 4: Ignoring transaction costs**
Backtests that assume zero slippage and zero commissions are fantasy.

Fix: Add at minimum 0.1% per trade for crypto, 1 pip for forex, $0.01/share for stocks. For realistic results, double it.

**Mistake 5: Not accounting for liquidity**
A strategy that trades $100k in a coin with $50k daily volume will move the market against you.

Fix: Never size a position larger than 1% of the average daily volume.

The strategies on this platform are backtested with realistic assumptions — that's why the live results actually match.`,
    likes: 241,
    views: 6890,
    replies: [
      { authorIndex: 0, content: 'The look-ahead bias point is the most common mistake I see from beginners. Even experienced coders make this mistake when using pandas — df["close"].shift(-1) is your friend.', likes: 58 },
      { authorIndex: 2, content: 'Walk-forward optimization is the gold standard but most retail traders don\'t know it exists. I\'d add: use at least 3 out-of-sample periods, not just one. One lucky period can still fool you.', likes: 44 },
      { authorIndex: 3, content: 'The liquidity point is critical for crypto. I\'ve seen "amazing" strategies that only work because they were backtested on coins where the strategy itself would have moved the price significantly.', likes: 31 },
      { authorIndex: 4, content: 'What\'s your take on Monte Carlo simulation for stress-testing backtests? I\'ve started running 1000 random permutations of my trade sequence to see the range of possible outcomes.', likes: 27 },
      { authorIndex: 1, content: '@Liam — Monte Carlo is excellent for understanding the distribution of outcomes. The key metric to look at is the 5th percentile result — that\'s your realistic worst case, not the average.', likes: 39 },
    ],
  },
  {
    authorIndex: 3,
    title: 'Trading psychology: how I stopped revenge trading after 2 years of losses',
    category: 'Education',
    content: `This is a personal post. I lost $34,000 over 2 years primarily because of revenge trading. I'm sharing this because I know I'm not alone.

**What revenge trading looks like:**
- Take a loss → immediately open a larger position to "make it back"
- That position loses → open an even larger position
- Account down 20% in one afternoon

I did this cycle dozens of times. The strategy wasn't the problem. My psychology was.

**What finally worked for me:**

**1. The 24-hour rule**
After any loss larger than 2% of my account, I am not allowed to trade for 24 hours. No exceptions. I literally close my trading platform.

**2. Pre-defined daily loss limit**
If I lose 4% in a day, trading is done for that day. I set this as a hard stop in my broker's risk settings so I physically cannot override it.

**3. Journaling every trade**
Not just the numbers — the emotions. "Why did I take this trade? What was I feeling?" After 3 months of journaling, patterns became obvious. I revenge traded most often on Mondays and after news events.

**4. Separating identity from results**
A losing trade doesn't make you a loser. A losing day doesn't make you a bad trader. The market is random in the short term. Your edge only shows over hundreds of trades.

**5. Meditation (I know, bear with me)**
10 minutes of meditation before each trading session. It sounds ridiculous but it measurably reduced my impulsive decisions. The research on this is solid.

I've been profitable for 14 consecutive months since implementing these rules. The strategy didn't change. I did.`,
    likes: 312,
    views: 8940,
    replies: [
      { authorIndex: 0, content: 'Thank you for sharing this. The 24-hour rule is something I\'ve implemented too and it\'s been transformative. The hardest part is the first 10 minutes after a big loss when everything in you wants to "fix" it immediately.', likes: 67 },
      { authorIndex: 1, content: 'The journaling point is underrated. I started tracking my emotional state (1-10 scale) before each trade. Discovered I had a 23% win rate when my stress level was above 7. Now I don\'t trade when stressed.', likes: 89 },
      { authorIndex: 2, content: 'The identity separation point is profound. Most traders define themselves by their P&L. When you lose, you feel like a failure as a person. Breaking that link is the real work.', likes: 74 },
      { authorIndex: 4, content: 'The broker-level daily loss limit is genius. Willpower is finite. Remove the decision entirely by making it impossible to override. I\'ve done the same thing.', likes: 51 },
      { authorIndex: 3, content: 'For anyone struggling with this: it gets better. The fact that you can recognize revenge trading as a pattern means you\'re already ahead of most traders. The awareness is the first step.', likes: 93 },
    ],
  },
];

// ── Seed function ──────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Seeding community discussions...\n');

  // 1. Upsert seed users
  const userIds = [];
  for (const u of seedUsers) {
    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', u.email)
      .single();

    if (existing) {
      userIds.push(existing.id);
      console.log(`  ✓ User exists: ${u.name}`);
    } else {
      const hashed = await bcrypt.hash(u.password, 10);
      const { data: created, error } = await supabase
        .from('users')
        .insert({ name: u.name, email: u.email, password: hashed })
        .select('id')
        .single();

      if (error) {
        console.error(`  ✗ Failed to create user ${u.name}:`, error.message);
        userIds.push(null);
      } else {
        userIds.push(created.id);
        console.log(`  ✓ Created user: ${u.name}`);
      }
    }
  }

  console.log('');

  // 2. Insert discussions + replies
  let discussionCount = 0;
  let replyCount = 0;

  for (const d of discussions) {
    const authorId = userIds[d.authorIndex];
    if (!authorId) { console.warn(`  ⚠ Skipping discussion (no author): ${d.title}`); continue; }

    // Insert discussion
    const { data: disc, error: dErr } = await supabase
      .from('discussions')
      .insert({
        user_id: authorId,
        title: d.title,
        category: d.category,
        content: d.content,
        likes: d.likes,
        views: d.views,
      })
      .select('id')
      .single();

    if (dErr) {
      console.error(`  ✗ Failed to insert discussion "${d.title}":`, dErr.message);
      continue;
    }

    discussionCount++;
    console.log(`  ✓ Discussion: "${d.title.slice(0, 60)}..."`);

    // Insert replies
    for (const r of d.replies) {
      const replyAuthorId = userIds[r.authorIndex];
      if (!replyAuthorId) continue;

      const { error: rErr } = await supabase
        .from('discussion_replies')
        .insert({
          discussion_id: disc.id,
          user_id: replyAuthorId,
          content: r.content,
          likes: r.likes,
        });

      if (rErr) {
        console.error(`    ✗ Reply failed:`, rErr.message);
      } else {
        replyCount++;
      }
    }
  }

  console.log(`\n✅ Done! Inserted ${discussionCount} discussions and ${replyCount} replies.`);
}

seed().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
