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
    likes: 5,
    views: 28,
    createdDaysAgo: 1,
    replies: [
      { authorIndex: 1, content: 'This is incredible. Did you use any specific indicator for the volume confirmation, or just raw volume bars? I\'ve been struggling with false breakouts on lower timeframes.', likes: 2 },
      { authorIndex: 2, content: 'The 2R partial take-profit rule is underrated. Most traders either hold too long or exit too early. Moving stop to breakeven after 50% out removes all the emotional pressure.', likes: 3 },
      { authorIndex: 0, content: '@Mia — I used 2% risk per trade throughout. So position size varied based on the distance to stop-loss. Never risked more than 2% of current account balance on any single trade.', likes: 2 },
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
    likes: 4,
    views: 19,
    createdDaysAgo: 3,
    replies: [
      { authorIndex: 2, content: 'The hidden divergence point is gold. Most YouTube tutorials only teach regular divergence and wonder why their win rate is 40%. Hidden divergence in a trend is one of the highest probability setups I know.', likes: 2 },
      { authorIndex: 1, content: '@Sofia — Great question. Crypto does produce more noise. I add a volume filter for crypto: the divergence candle must have below-average volume (showing exhaustion), while the confirmation candle must have above-average volume. This cuts false signals by about 40%.', likes: 3 },
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
    likes: 5,
    views: 24,
    createdDaysAgo: 3,
    replies: [
      { authorIndex: 0, content: 'The Kelly Criterion explanation is the clearest I\'ve seen. Most people just say "risk 1-2%" without explaining the math behind it. This should be pinned.', likes: 3 },
      { authorIndex: 1, content: 'I\'d add one more thing: correlation risk. If you\'re running 3 crypto strategies simultaneously, they\'re all correlated. Your effective risk per "market event" is much higher than 2% × 3 = 6%.', likes: 2 },
      { authorIndex: 3, content: 'How do you handle position sizing when the stop-loss is very wide? Sometimes a proper technical stop requires 5-6% price movement, which means a tiny position size.', likes: 1 },
      { authorIndex: 2, content: '@Sofia — If the stop requires 5-6% price movement and you want to risk 2% of account, your position size is just 2/5 = 0.4% of account in the asset. Small position, but that\'s correct. Wide stops = small size. Never widen your stop to fit a larger position.', likes: 2 },
      { authorIndex: 4, content: 'This is why I love the strategies on this platform — they all come with defined max drawdown stats so you can calculate proper position sizing before you even start.', likes: 1 },
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
    likes: 4,
    views: 22,
    createdDaysAgo: 5,
    replies: [
      { authorIndex: 0, content: 'The double-entry bug is a classic. Always implement idempotency checks — if an order ID already exists, don\'t submit again. Saved me from a similar disaster.', likes: 2 },
      { authorIndex: 1, content: 'What was your slippage on average vs backtest assumption? This is the biggest hidden cost most people ignore when going from backtest to live.', likes: 1 },
      { authorIndex: 3, content: '@Mia — Backtest assumed 0.5 tick slippage. Live average was 1.2 ticks during normal hours, 2.8 ticks in the first 30 minutes. I now exclude the first 30 minutes from the strategy window.', likes: 3 },
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
    likes: 3,
    views: 16,
    createdDaysAgo: 6,
    replies: [
      { authorIndex: 1, content: 'The delta divergence concept is what finally made order flow click for me. When price makes a new high but delta is negative, it means the move was driven by stop-hunting, not genuine buying. Reversal incoming.', likes: 2 },
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
    likes: 4,
    views: 18,
    createdDaysAgo: 8,
    replies: [
      { authorIndex: 2, content: 'The PDT rule point for stocks is huge and often overlooked. Many beginners blow up trying to day trade stocks with a $5k account, not realizing they\'re limited to 3 round trips per week.', likes: 2 },
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
    likes: 5,
    views: 30,
    createdDaysAgo: 9,
    replies: [
      { authorIndex: 0, content: 'The look-ahead bias point is the most common mistake I see from beginners. Even experienced coders make this mistake when using pandas — df["close"].shift(-1) is your friend.', likes: 3 },
      { authorIndex: 2, content: 'Walk-forward optimization is the gold standard but most retail traders don\'t know it exists. I\'d add: use at least 3 out-of-sample periods, not just one. One lucky period can still fool you.', likes: 2 },
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
    likes: 5,
    views: 27,
    createdDaysAgo: 11,
    replies: [
      { authorIndex: 0, content: 'Thank you for sharing this. The 24-hour rule is something I\'ve implemented too and it\'s been transformative. The hardest part is the first 10 minutes after a big loss when everything in you wants to "fix" it immediately.', likes: 3 },
      { authorIndex: 1, content: 'The journaling point is underrated. I started tracking my emotional state (1-10 scale) before each trade. Discovered I had a 23% win rate when my stress level was above 7. Now I don\'t trade when stressed.', likes: 2 },
      { authorIndex: 2, content: 'The identity separation point is profound. Most traders define themselves by their P&L. When you lose, you feel like a failure as a person. Breaking that link is the real work.', likes: 3 },
      { authorIndex: 4, content: 'The broker-level daily loss limit is genius. Willpower is finite. Remove the decision entirely by making it impossible to override. I\'ve done the same thing.', likes: 1 },
    ],
  },
  {
    authorIndex: 4,
    title: 'EMA Crossover Trend - 6 months live trading results on BTC daily',
    category: 'Strategy',
    content: `I have been running the EMA Crossover Trend strategy on BTC/USDT daily timeframe for 6 months. Here are my honest results.

Setup: EMA 20/50/200 with volume confirmation on daily closes. Golden cross = long, death cross = exit.

Results (Jan–Jun 2025):
- Total signals: 8
- Winners: 5 (62.5%)
- Losers: 3 (37.5%)
- Best trade: +34.2% (caught the Jan–Mar bull run)
- Worst trade: -12.1% (false breakout in April)
- Net return: +67.4%
- Max drawdown: -18.3%

Key observations:
1. The EMA 200 filter is critical. I tried removing it and my win rate dropped to 44%.
2. Volume confirmation on the crossover day eliminated 2 false signals that would have cost me 8% each.
3. The 15% trailing stop saved me twice from giving back large gains.

The strategy is slow — only 8 signals in 6 months. But each signal is high quality. This is not for impatient traders.

Currently in a long position entered at $67,400. Stop at $57,290 (15% trailing from $67,400).`,
    likes: 3,
    views: 14,
    createdDaysAgo: 12,
    replies: [
      { authorIndex: 0, content: 'The EMA 200 filter point is something I learned the hard way too. Without it you get whipsawed constantly in ranging markets. It acts as a macro trend filter that keeps you on the right side.', likes: 2 },
    ],
  },
  {
    authorIndex: 2,
    title: 'Bollinger Band Squeeze — catching explosive moves before they happen',
    category: 'Strategy',
    content: `The Bollinger Band Squeeze is one of my favorite setups because it gives you advance warning of a big move before it happens. Here is how I trade it.

The setup: When Bollinger Band width reaches a 6-month low, the market is coiling. Energy is building. A big move is coming — you just don't know which direction yet.

My entry rules:
1. Band width must be at or near 6-month low (I use a 126-period lookback)
2. Wait for the first expansion candle after the squeeze
3. If it closes ABOVE the upper band — go long
4. If it closes BELOW the lower band — go short
5. Stop at the middle band (20 SMA)
6. Target: entry price ± band width at time of entry

Recent trade on SOL/USDT:
- Squeeze identified at $142 (band width at 6-month low)
- Expansion candle closed above upper band at $156
- Entry: $156
- Stop: $148 (middle band)
- Target: $156 + $28 (band width) = $184
- Result: Hit target in 11 days. +17.9%

The key is patience during the squeeze. Sometimes it lasts 2 weeks. Don't try to predict direction — wait for the market to tell you.`,
    likes: 4,
    views: 21,
    createdDaysAgo: 14,
    replies: [
      { authorIndex: 3, content: 'The patience point is everything. I used to try to predict which way the squeeze would break and got burned constantly. Now I just set alerts for both directions and wait.', likes: 2 },
      { authorIndex: 0, content: 'How do you handle false breakouts? Sometimes price closes outside the band and then immediately reverses back inside. Do you have a filter for that?', likes: 1 },
      { authorIndex: 2, content: '@Alex — I require the breakout candle to close at least 0.5% outside the band, not just touch it. Also, volume must be above the 20-period average on the breakout candle. These two filters eliminate about 70% of false breakouts.', likes: 2 },
    ],
  },
  {
    authorIndex: 0,
    title: 'Turtle Trading System — why a 42% win rate can still make you rich',
    category: 'Strategy',
    content: `Most traders think you need a high win rate to be profitable. The Turtle Trading System proves otherwise. Here is why a 42% win rate is actually fine.

The math:
- Win rate: 42%
- Average winner: +24.6%
- Average loser: -8.8%
- Profit factor: 2.1

Expected value per trade = (0.42 × 24.6) - (0.58 × 8.8) = 10.33 - 5.10 = +5.23%

Every trade has a positive expected value of +5.23% of risked capital. Over 89 trades, that compounds significantly.

The psychological challenge:
You will lose 58% of your trades. That means roughly 6 out of every 10 trades are losers. Most traders cannot handle this emotionally and abandon the system during a losing streak.

The solution: Think in batches of 20 trades, not individual trades. Over any 20-trade sample, the math should work out. One losing trade means nothing.

My 12-month results running the Turtle System on BTC:
- 89 trades
- 49 winners, 40 losers
- Net return: +128%
- Max drawdown: -22.4%

The system works. The question is whether you can follow it.`,
    likes: 4,
    views: 23,
    createdDaysAgo: 15,
    replies: [
      { authorIndex: 1, content: 'The "think in batches of 20" mental model is something every trader needs to internalize. Individual trade outcomes are noise. The edge only shows over a large sample.', likes: 2 },
      { authorIndex: 4, content: 'The 22.4% max drawdown is the real test. Most people say they can handle drawdowns until they\'re actually sitting in one. Have you ever been tempted to abandon the system during a losing streak?', likes: 1 },
      { authorIndex: 0, content: '@Liam — Yes, absolutely. In March I had 7 consecutive losses. My account was down 14%. Every instinct said to stop. I kept a journal entry from that period: "The system is not broken. I am in a normal losing streak. Keep going." I\'m glad I did.', likes: 3 },
    ],
  },
  {
    authorIndex: 1,
    title: 'ML Momentum Scanner — how machine learning actually works in trading',
    category: 'Analysis',
    content: `A lot of people see "ML" and think it is magic. It is not. Here is exactly how the ML Momentum Scanner works and why it outperforms traditional indicators.

The model: XGBoost gradient boosting classifier trained on 3 years of 4H BTC/ETH data.

Input features (12 total):
1. RSI(14)
2. MACD histogram value
3. EMA 20/50/200 alignment score (0-3)
4. Volume ratio (current / 20-period average)
5. ATR percentile (where current ATR sits in 52-week range)
6. Bollinger Band %B
7. 5-period price momentum
8. 10-period price momentum
9. 20-period price momentum
10. Candle body/wick ratio
11. Previous candle direction
12. Time of day (session)

Output: Probability score 0-1 (bearish to bullish)
- Score > 0.75: Long signal
- Score < 0.25: Short signal
- 0.25-0.75: No trade

Why it beats single indicators:
A single RSI reading tells you one thing. The model combines 12 signals simultaneously and weights them based on what has historically mattered most. In trending markets, momentum features dominate. In ranging markets, mean-reversion features dominate. The model adapts automatically.

Walk-forward validation results:
- Training: 2021-2023 data
- Testing: 2024 data (never seen during training)
- Out-of-sample win rate: 67%
- Out-of-sample profit factor: 3.1

The 67% win rate on data the model never saw is what makes this credible.`,
    likes: 5,
    views: 26,
    createdDaysAgo: 17,
    replies: [
      { authorIndex: 2, content: 'The walk-forward validation point is crucial. Anyone can get 80%+ win rate by overfitting to historical data. The out-of-sample performance is the only number that matters.', likes: 3 },
      { authorIndex: 3, content: 'How often is the model retrained? Markets change over time. A model trained on 2021-2023 data might not capture the current market regime.', likes: 1 },
      { authorIndex: 1, content: '@Sofia — Great question. The model is retrained quarterly with a rolling 3-year window. This keeps it current without overfitting to very recent data. The feature set stays constant — only the weights change.', likes: 2 },
    ],
  },
  {
    authorIndex: 3,
    title: 'Funding Rate Arbitrage — the strategy most crypto traders have never heard of',
    category: 'Strategy',
    content: `Funding rates are one of the most reliable signals in crypto and almost nobody talks about them. Here is how I use them.

What is a funding rate?
Perpetual futures contracts have no expiry. To keep them anchored to spot price, exchanges charge a funding fee every 8 hours. When longs are dominant, longs pay shorts. When shorts are dominant, shorts pay longs.

The signal:
- Funding rate > +0.1%: Market is extremely long-biased. Correction likely.
- Funding rate < -0.05%: Market is extremely short-biased. Bounce likely.

My rules:
1. Funding rate must exceed +0.1% (or drop below -0.05%)
2. RSI confirmation: >70 for shorts, <30 for longs
3. Enter at 4H candle close after the funding spike
4. Stop: 2% beyond entry
5. Target: 4% (2:1 R:R)
6. Exit immediately if funding normalizes before target

12-month results on BTC/ETH perpetuals:
- 178 signals
- Win rate: 67%
- Average winner: +3.8%
- Average loser: -2.1%
- Net return: +142%

The edge comes from the fact that extreme funding rates represent market imbalance. When everyone is positioned the same way, the move to correct that imbalance is predictable.`,
    likes: 4,
    views: 20,
    createdDaysAgo: 19,
    replies: [
      { authorIndex: 0, content: 'This is one of the most underrated strategies in crypto. The funding rate is essentially a sentiment indicator that has real money behind it — people are paying to hold those positions.', likes: 2 },
      { authorIndex: 4, content: 'Where do you get funding rate data? I know Binance shows it on the perpetuals page but is there a way to get historical data for backtesting?', likes: 1 },
      { authorIndex: 3, content: '@Liam — Coinglass.com has excellent historical funding rate data going back years. You can export it as CSV. CryptoQuant also has it with API access.', likes: 2 },
    ],
  },
  {
    authorIndex: 4,
    title: 'On-chain whale tracking — how I follow smart money in crypto',
    category: 'Analysis',
    content: `Blockchain data is public. Every large wallet movement is visible. Here is how I use on-chain data to follow what the big players are doing.

Key metrics I track:

1. Exchange Net Flow
When large amounts of BTC move FROM exchanges TO cold wallets = accumulation (bullish)
When large amounts move TO exchanges = potential selling (bearish)

2. Whale Wallet Activity
Wallets holding >1000 BTC are tracked by services like Glassnode and CryptoQuant. When these wallets accumulate, price tends to follow within 2-4 weeks.

3. SOPR (Spent Output Profit Ratio)
SOPR > 1: Coins being moved are in profit (potential selling pressure)
SOPR < 1: Coins being moved are at a loss (capitulation, potential bottom)

My trading rule:
- Net exchange outflow > 500 BTC in 24h + price above 50-day EMA + RSI < 60 = Long signal
- Hold for 5-15 days
- Stop: 5% below entry
- Target: 10% above entry

12-month results:
- 112 signals
- Win rate: 60%
- Average winner: +12.4%
- Average loser: -5.2%
- Net return: +134%

The edge: on-chain data is a leading indicator. It shows you what is happening before it shows up in price.`,
    likes: 3,
    views: 17,
    createdDaysAgo: 20,
    replies: [
      { authorIndex: 1, content: 'The exchange net flow metric is something I check every morning. It is one of the few indicators that actually has predictive power rather than just describing what already happened.', likes: 2 },
      { authorIndex: 2, content: 'What services do you use for this data? Glassnode is expensive. Are there free alternatives that are good enough for retail traders?', likes: 1 },
    ],
  },
  {
    authorIndex: 0,
    title: 'MACD Divergence deep dive — my 200-trade analysis',
    category: 'Strategy',
    content: `I tracked every MACD divergence signal I took over 200 trades across 8 months. Here is what the data actually shows.

Setup: MACD(12,26,9) on 4H charts. Regular divergence for reversals, hidden divergence for trend continuation.

Results by divergence type:

Regular Bearish Divergence (reversal):
- 67 signals
- Win rate: 58%
- Average winner: +8.2%
- Average loser: -4.1%
- Best context: After RSI >70 and at key resistance

Regular Bullish Divergence (reversal):
- 71 signals
- Win rate: 61%
- Average winner: +9.4%
- Average loser: -4.3%
- Best context: After RSI <30 and at key support

Hidden Bullish Divergence (continuation):
- 62 signals
- Win rate: 71%
- Average winner: +11.2%
- Average loser: -3.8%
- Best context: During uptrend, on pullback to EMA 20

Key finding: Hidden divergence outperforms regular divergence significantly. The 71% win rate on hidden bullish divergence is the highest of any setup I have tested.

The reason: Hidden divergence trades WITH the trend. You have the trend as a tailwind. Regular divergence fights the trend, which is inherently lower probability.`,
    likes: 5,
    views: 25,
    createdDaysAgo: 22,
    replies: [
      { authorIndex: 3, content: 'The hidden vs regular divergence win rate difference is striking. 71% vs 58-61% is a massive edge. I am going to focus exclusively on hidden divergence for the next 3 months and track my results.', likes: 3 },
      { authorIndex: 1, content: 'Did you filter by market regime? I suspect regular divergence works better in ranging markets and hidden divergence works better in trending markets. Would love to see that breakdown.', likes: 2 },
      { authorIndex: 0, content: '@Mia — You are exactly right. When I filtered by ADX (>25 = trending, <25 = ranging), regular divergence win rate in ranging markets jumped to 68%. Hidden divergence in trending markets hit 76%. Context is everything.', likes: 3 },
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

  // 2. Insert discussions + replies with realistic dates
  let discussionCount = 0;
  let replyCount = 0;

  for (const d of discussions) {
    const authorId = userIds[d.authorIndex];
    if (!authorId) { console.warn(`  ⚠ Skipping discussion (no author): ${d.title}`); continue; }

    // Calculate created_at based on createdDaysAgo
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - (d.createdDaysAgo || 0));

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
        created_at: createdAt.toISOString(),
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

