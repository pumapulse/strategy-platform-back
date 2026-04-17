require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const strategies = [
  {
    id: 1,
    name: 'Breakout Momentum',
    market: 'Crypto',
    timeframe: '4H',
    win_rate: 62,
    profit_factor: 2.1,
    max_drawdown: 11.2,
    avg_return: 8.4,
    description: 'Identifies price consolidation zones and enters on confirmed breakouts with volume surge. Works best on BTC/USDT and ETH/USDT during trending markets. Uses ATR-based stops to filter noise.',
    rules: JSON.stringify([
      'Wait for price to consolidate for at least 8 candles (ATR < 0.8%)',
      'Enter on first candle closing above range high with volume > 1.5x 20-period average',
      'Set stop-loss 1 ATR below breakout candle low',
      'Take 50% profit at 2R, move stop to breakeven',
      'Trail remaining position with 2 ATR trailing stop'
    ]),
    pros: JSON.stringify(['High reward-to-risk ratio', 'Clear entry and exit rules', 'Works in trending markets', 'Easy to automate']),
    cons: JSON.stringify(['Whipsaws in ranging markets', 'Requires volume confirmation', 'Less effective on low-cap coins']),
    equity: JSON.stringify([10000,10840,11200,10900,12300,13800,13100,16000,18100,16800,20900,24100]),
    monthly_returns: JSON.stringify([0,8.4,3.3,-2.7,12.8,12.2,-5.1,22.1,13.1,-7.2,24.4,15.3]),
    trades: JSON.stringify([
      {pair:'BTC/USDT',type:'buy',entry:42000,exit:46200,pnl:10.0,date:'2024-01-15'},
      {pair:'ETH/USDT',type:'buy',entry:2200,exit:2530,pnl:15.0,date:'2024-01-28'},
      {pair:'SOL/USDT',type:'buy',entry:95,exit:88,pnl:-7.4,date:'2024-02-10'},
      {pair:'BTC/USDT',type:'buy',entry:48000,exit:54000,pnl:12.5,date:'2024-02-22'}
    ]),
    backtest_data: JSON.stringify({total_trades:247,winning_trades:153,losing_trades:94,avg_win:8.4,avg_loss:3.1,max_consecutive_losses:6})
  },
  {
    id: 2,
    name: 'RSI Mean Reversion',
    market: 'Crypto',
    timeframe: '1H',
    win_rate: 68,
    profit_factor: 1.9,
    max_drawdown: 8.7,
    avg_return: 5.2,
    description: 'Exploits oversold/overbought conditions using RSI divergence combined with key support/resistance levels. Enters counter-trend positions when RSI shows hidden divergence at major levels.',
    rules: JSON.stringify([
      'RSI(14) must be below 30 (oversold) or above 70 (overbought)',
      'Look for bullish/bearish divergence between price and RSI',
      'Entry only at key support/resistance or Fibonacci levels',
      'Stop-loss below/above the swing low/high',
      'Target previous swing high/low for take profit'
    ]),
    pros: JSON.stringify(['High win rate', 'Works in ranging markets', 'Clear invalidation levels', 'Multiple timeframe confirmation']),
    cons: JSON.stringify(['Lower reward-to-risk', 'Can miss strong trends', 'Requires patience for setups']),
    equity: JSON.stringify([10000,10520,11100,10800,11900,12800,12400,14200,15600,14900,17100,19200]),
    monthly_returns: JSON.stringify([0,5.2,5.5,-2.7,10.2,7.6,-3.1,14.5,9.9,-4.5,14.8,12.3]),
    trades: JSON.stringify([
      {pair:'ETH/USDT',type:'buy',entry:1800,exit:1980,pnl:10.0,date:'2024-01-08'},
      {pair:'BNB/USDT',type:'sell',entry:320,exit:295,pnl:7.8,date:'2024-01-19'},
      {pair:'BTC/USDT',type:'buy',entry:38000,exit:41200,pnl:8.4,date:'2024-02-05'}
    ]),
    backtest_data: JSON.stringify({total_trades:312,winning_trades:212,losing_trades:100,avg_win:5.2,avg_loss:2.8,max_consecutive_losses:5})
  },
  {
    id: 3,
    name: 'VWAP Scalper',
    market: 'Stocks',
    timeframe: '15M',
    win_rate: 61,
    profit_factor: 1.8,
    max_drawdown: 6.4,
    avg_return: 3.1,
    description: 'Intraday scalping strategy using VWAP as dynamic support/resistance. Enters long when price reclaims VWAP with momentum, shorts when price fails at VWAP. Best used during first 2 hours of market open.',
    rules: JSON.stringify([
      'Trade only between 9:30-11:30 AM EST',
      'Long: price dips below VWAP then reclaims it with a bullish candle',
      'Short: price rallies above VWAP then fails with a bearish candle',
      'Volume must be above 20-period average on entry candle',
      'Stop-loss 0.5% beyond VWAP, target 1.5% minimum'
    ]),
    pros: JSON.stringify(['High frequency setups', 'Clear VWAP reference', 'Works on liquid stocks', 'Defined risk per trade']),
    cons: JSON.stringify(['Requires active monitoring', 'Slippage on fast moves', 'PDT rule for small accounts', 'Less effective in low-volume sessions']),
    equity: JSON.stringify([10000,10310,10650,10420,11100,11680,11350,12400,13100,12700,13900,14800]),
    monthly_returns: JSON.stringify([0,3.1,3.3,-2.2,6.5,5.2,-2.8,9.2,5.6,-3.1,9.4,6.5]),
    trades: JSON.stringify([
      {pair:'AAPL',type:'buy',entry:182,exit:184.7,pnl:1.5,date:'2024-01-10'},
      {pair:'TSLA',type:'sell',entry:245,exit:238,pnl:2.9,date:'2024-01-17'},
      {pair:'NVDA',type:'buy',entry:495,exit:512,pnl:3.4,date:'2024-02-01'}
    ]),
    backtest_data: JSON.stringify({total_trades:892,winning_trades:544,losing_trades:348,avg_win:3.1,avg_loss:1.9,max_consecutive_losses:8})
  },
  {
    id: 4,
    name: 'Ichimoku Cloud Trend',
    market: 'Forex',
    timeframe: '4H',
    win_rate: 55,
    profit_factor: 2.4,
    max_drawdown: 13.5,
    avg_return: 12.1,
    description: 'Full Ichimoku system using all five components for high-probability trend trades. Enters only when price, Tenkan, Kijun, and Chikou all align. Kumo twist signals trend changes.',
    rules: JSON.stringify([
      'Price must be above/below the Kumo cloud',
      'Tenkan-sen must cross Kijun-sen in direction of trade',
      'Chikou span must be above/below price 26 periods ago',
      'Kumo ahead must be bullish/bearish (future cloud)',
      'Enter on Tenkan/Kijun cross, stop below Kijun'
    ]),
    pros: JSON.stringify(['Multiple confirmation filters', 'Built-in support/resistance', 'Works on all timeframes', 'Trend-following with momentum']),
    cons: JSON.stringify(['Complex for beginners', 'Lagging signals', 'Choppy in sideways markets', 'Wide stops required']),
    equity: JSON.stringify([10000,11210,12500,11800,13900,15800,14600,18200,21400,19800,24700,28900]),
    monthly_returns: JSON.stringify([0,12.1,11.5,-5.6,17.8,13.7,-7.6,24.7,17.6,-7.5,24.7,17.0]),
    trades: JSON.stringify([
      {pair:'EUR/USD',type:'buy',entry:1.0850,exit:1.1020,pnl:15.7,date:'2024-01-12'},
      {pair:'GBP/JPY',type:'sell',entry:188.5,exit:184.2,pnl:22.8,date:'2024-02-08'},
      {pair:'USD/JPY',type:'buy',entry:148.2,exit:151.8,pnl:24.3,date:'2024-02-20'}
    ]),
    backtest_data: JSON.stringify({total_trades:134,winning_trades:74,losing_trades:60,avg_win:12.1,avg_loss:5.2,max_consecutive_losses:7})
  },
  {
    id: 5,
    name: 'EMA Crossover Trend',
    market: 'Crypto',
    timeframe: 'Daily',
    win_rate: 58,
    profit_factor: 2.8,
    max_drawdown: 18.3,
    avg_return: 18.2,
    description: 'Classic EMA 20/50/200 crossover system adapted for crypto markets. Uses the golden/death cross on daily timeframe with volume confirmation. Holds positions for weeks to months.',
    rules: JSON.stringify([
      'EMA 20 crosses above EMA 50 (golden cross) — go long',
      'EMA 20 crosses below EMA 50 (death cross) — go short or exit',
      'Price must be above EMA 200 for longs, below for shorts',
      'Volume on crossover day must be above 30-day average',
      'Hold until opposite crossover or 15% trailing stop hit'
    ]),
    pros: JSON.stringify(['Catches major trends', 'Simple rules', 'Low maintenance', 'Proven over decades']),
    cons: JSON.stringify(['Late entries', 'Large drawdowns', 'Many false signals in ranging markets', 'Requires patience']),
    equity: JSON.stringify([10000,12240,14800,13200,17600,22400,19800,27200,34100,29800,38900,47200]),
    monthly_returns: JSON.stringify([0,22.4,20.9,-10.8,33.3,27.3,-11.6,37.4,25.4,-12.6,30.5,21.3]),
    trades: JSON.stringify([
      {pair:'BTC/USDT',type:'buy',entry:28000,exit:48000,pnl:71.4,date:'2024-01-01'},
      {pair:'ETH/USDT',type:'buy',entry:1600,exit:3200,pnl:100.0,date:'2024-01-15'},
      {pair:'SOL/USDT',type:'buy',entry:60,exit:180,pnl:200.0,date:'2024-02-01'}
    ]),
    backtest_data: JSON.stringify({total_trades:67,winning_trades:35,losing_trades:32,avg_win:22.4,avg_loss:8.1,max_consecutive_losses:9})
  },
  {
    id: 6,
    name: 'Bollinger Band Squeeze',
    market: 'Crypto',
    timeframe: '4H',
    win_rate: 58,
    profit_factor: 2.0,
    max_drawdown: 9.8,
    avg_return: 7.6,
    description: 'Identifies periods of low volatility (squeeze) followed by explosive breakouts. Uses Bollinger Band width to detect compression, then enters on the first directional candle after expansion.',
    rules: JSON.stringify([
      'Bollinger Band width must be at 6-month low (squeeze)',
      'Wait for bands to start expanding',
      'Enter long if first expansion candle is bullish with close above upper band',
      'Enter short if first expansion candle is bearish with close below lower band',
      'Stop-loss at middle band (20 EMA), target 2x band width'
    ]),
    pros: JSON.stringify(['Explosive moves after squeeze', 'Clear entry trigger', 'Works on all markets', 'Good risk/reward']),
    cons: JSON.stringify(['False breakouts common', 'Requires patience during squeeze', 'Can miss entry on fast moves']),
    equity: JSON.stringify([10000,10760,11380,10920,12200,13400,12800,14900,16300,15600,17800,19700]),
    monthly_returns: JSON.stringify([0,7.6,5.8,-4.0,11.7,9.8,-4.5,16.4,9.4,-4.3,14.1,10.7]),
    trades: JSON.stringify([
      {pair:'BTC/USDT',type:'buy',entry:43000,exit:47300,pnl:10.0,date:'2024-01-20'},
      {pair:'ETH/USDT',type:'buy',entry:2100,exit:2420,pnl:15.2,date:'2024-02-14'},
      {pair:'AVAX/USDT',type:'buy',entry:35,exit:42,pnl:20.0,date:'2024-03-01'}
    ]),
    backtest_data: JSON.stringify({total_trades:189,winning_trades:110,losing_trades:79,avg_win:7.6,avg_loss:3.8,max_consecutive_losses:6})
  },
  {
    id: 7,
    name: 'Support & Resistance Flip',
    market: 'Forex',
    timeframe: '1H',
    win_rate: 64,
    profit_factor: 1.7,
    max_drawdown: 7.2,
    avg_return: 4.8,
    description: 'Trades the classic support-becomes-resistance and resistance-becomes-support flip. Waits for a level to be broken, then enters on the retest of that level from the other side.',
    rules: JSON.stringify([
      'Identify key S/R level with at least 3 touches',
      'Wait for clean break of the level (candle close beyond)',
      'Enter on first retest of the broken level',
      'Confirmation: rejection candle (pin bar, engulfing) at retest',
      'Stop-loss beyond the retest candle, target next major S/R'
    ]),
    pros: JSON.stringify(['High probability setups', 'Clear invalidation', 'Works on all pairs', 'Multiple timeframe alignment']),
    cons: JSON.stringify(['Requires level identification skill', 'Can miss fast retests', 'Not all breaks retest']),
    equity: JSON.stringify([10000,10480,10980,10620,11500,12200,11800,13100,14200,13700,15200,16700]),
    monthly_returns: JSON.stringify([0,4.8,4.8,-3.3,8.3,6.1,-3.3,11.0,8.4,-3.5,10.9,9.9]),
    trades: JSON.stringify([
      {pair:'EUR/USD',type:'sell',entry:1.0950,exit:1.0820,pnl:11.9,date:'2024-01-14'},
      {pair:'GBP/USD',type:'buy',entry:1.2650,exit:1.2780,pnl:10.3,date:'2024-01-28'},
      {pair:'USD/CAD',type:'sell',entry:1.3580,exit:1.3450,pnl:9.6,date:'2024-02-12'}
    ]),
    backtest_data: JSON.stringify({total_trades:278,winning_trades:178,losing_trades:100,avg_win:4.8,avg_loss:2.9,max_consecutive_losses:5})
  },
  {
    id: 8,
    name: 'MACD Divergence',
    market: 'Crypto',
    timeframe: '4H',
    win_rate: 59,
    profit_factor: 2.2,
    max_drawdown: 10.4,
    avg_return: 9.3,
    description: 'Trades regular and hidden MACD divergences at key market structure levels. Regular divergence signals reversals, hidden divergence signals trend continuation. Uses histogram for timing.',
    rules: JSON.stringify([
      'Identify regular divergence: price makes new high/low but MACD does not',
      'Hidden divergence: price makes higher low but MACD makes lower low (bullish)',
      'Entry on MACD histogram flip (from negative to positive or vice versa)',
      'Must occur at key support/resistance or Fibonacci level',
      'Stop beyond the divergence swing, target 2:1 minimum'
    ]),
    pros: JSON.stringify(['Early reversal signals', 'Works on trending and ranging markets', 'Clear histogram trigger', 'High reward potential']),
    cons: JSON.stringify(['Can diverge for extended periods', 'Requires context reading', 'False signals in strong trends']),
    equity: JSON.stringify([10000,10930,11800,11200,13000,14900,14000,16800,19000,17800,21400,24800]),
    monthly_returns: JSON.stringify([0,9.3,8.0,-5.1,16.1,14.6,-6.0,20.0,13.1,-6.3,20.2,15.9]),
    trades: JSON.stringify([
      {pair:'BTC/USDT',type:'buy',entry:40000,exit:44500,pnl:11.3,date:'2024-01-18'},
      {pair:'ETH/USDT',type:'sell',entry:2800,exit:2520,pnl:10.0,date:'2024-02-05'},
      {pair:'LINK/USDT',type:'buy',entry:14,exit:17.5,pnl:25.0,date:'2024-02-25'}
    ]),
    backtest_data: JSON.stringify({total_trades:203,winning_trades:120,losing_trades:83,avg_win:9.3,avg_loss:4.2,max_consecutive_losses:7})
  },
  {
    id: 9,
    name: 'Fibonacci Retracement',
    market: 'Forex',
    timeframe: 'Daily',
    win_rate: 57,
    profit_factor: 2.1,
    max_drawdown: 12.1,
    avg_return: 11.4,
    description: 'Enters pullbacks in established trends at key Fibonacci levels (38.2%, 50%, 61.8%). Combines Fibonacci with candlestick patterns and RSI for high-probability entries in the direction of the trend.',
    rules: JSON.stringify([
      'Identify clear impulse move (at least 100 pips on forex)',
      'Draw Fibonacci from swing low to swing high (or vice versa)',
      'Wait for price to pull back to 38.2%, 50%, or 61.8% level',
      'Look for rejection candle (pin bar, engulfing) at Fibonacci level',
      'RSI must be between 40-60 on pullback, stop beyond 78.6% level'
    ]),
    pros: JSON.stringify(['Universal tool', 'Works on all markets', 'Clear entry zones', 'Trend-following with pullback entry']),
    cons: JSON.stringify(['Subjective swing selection', 'Multiple levels can confuse', 'Requires trend identification']),
    equity: JSON.stringify([10000,11080,12280,11500,13600,15600,14400,17600,20500,18900,22900,27000]),
    monthly_returns: JSON.stringify([0,10.8,10.8,-6.3,18.3,14.7,-7.7,22.2,16.5,-7.8,21.2,17.9]),
    trades: JSON.stringify([
      {pair:'EUR/USD',type:'buy',entry:1.0780,exit:1.1050,pnl:25.0,date:'2024-01-22'},
      {pair:'GBP/USD',type:'buy',entry:1.2580,exit:1.2850,pnl:21.5,date:'2024-02-10'},
      {pair:'AUD/USD',type:'sell',entry:0.6580,exit:0.6380,pnl:30.4,date:'2024-03-05'}
    ]),
    backtest_data: JSON.stringify({total_trades:156,winning_trades:89,losing_trades:67,avg_win:10.8,avg_loss:5.1,max_consecutive_losses:8})
  },
  {
    id: 10,
    name: 'ML Momentum Scanner',
    market: 'Crypto',
    timeframe: '4H',
    win_rate: 71,
    profit_factor: 3.2,
    max_drawdown: 8.9,
    avg_return: 14.7,
    description: 'Machine learning-enhanced momentum strategy that combines 12 technical indicators to score momentum strength. Uses gradient boosting to predict next-candle direction with 71% accuracy on backtests.',
    rules: JSON.stringify([
      'ML score must be above 0.75 (out of 1.0) for long, below 0.25 for short',
      'Momentum confirmed by: RSI > 55, MACD positive, price above EMA 20',
      'Volume must be in top 20% of 50-period range',
      'Enter at market open of next candle after signal',
      'Dynamic stop-loss based on ATR(14) x 1.5, target ATR x 3'
    ]),
    pros: JSON.stringify(['Highest win rate in portfolio', 'Multi-indicator confirmation', 'Adaptive to market conditions', 'Quantified entry criteria']),
    cons: JSON.stringify(['Complex to replicate manually', 'Requires backtesting software', 'Overfitting risk if not validated']),
    equity: JSON.stringify([10000,11470,13140,12500,15300,18200,17100,21400,25600,23800,29400,35200]),
    monthly_returns: JSON.stringify([0,14.7,14.6,-4.9,22.4,19.0,-6.0,25.1,19.6,-7.0,23.5,19.7]),
    trades: JSON.stringify([
      {pair:'BTC/USDT',type:'buy',entry:44000,exit:51000,pnl:15.9,date:'2024-01-25'},
      {pair:'ETH/USDT',type:'buy',entry:2300,exit:2760,pnl:20.0,date:'2024-02-08'},
      {pair:'SOL/USDT',type:'buy',entry:100,exit:128,pnl:28.0,date:'2024-02-20'}
    ]),
    backtest_data: JSON.stringify({total_trades:289,winning_trades:205,losing_trades:84,avg_win:14.7,avg_loss:4.6,max_consecutive_losses:4})
  },
  {
    id: 11,
    name: 'Opening Range Breakout',
    market: 'Stocks',
    timeframe: '15M',
    win_rate: 58,
    profit_factor: 2.3,
    max_drawdown: 8.1,
    avg_return: 7.2,
    description: 'Trades breakouts from the first 30-minute opening range. The high and low of the first 30 minutes define the range. Breakout above = long, below = short. Best on high-volume stocks with news catalysts.',
    rules: JSON.stringify([
      'Define opening range: high and low of first 30 minutes (9:30-10:00 AM)',
      'Long: price breaks above opening range high with volume spike',
      'Short: price breaks below opening range low with volume spike',
      'Volume on breakout candle must be 2x average',
      'Stop-loss at midpoint of opening range, target 2x range size'
    ]),
    pros: JSON.stringify(['Clear range definition', 'High volume confirmation', 'Works on earnings plays', 'Defined risk']),
    cons: JSON.stringify(['Only works first 2 hours', 'Requires pre-market research', 'Gaps can cause slippage']),
    equity: JSON.stringify([10000,10690,11360,10900,11900,12900,12400,13800,14900,14300,15700,17000]),
    monthly_returns: JSON.stringify([0,6.9,6.2,-4.1,9.2,8.4,-3.9,11.3,8.0,-4.0,9.8,8.3]),
    trades: JSON.stringify([
      {pair:'NVDA',type:'buy',entry:480,exit:512,pnl:6.7,date:'2024-01-16'},
      {pair:'META',type:'buy',entry:390,exit:418,pnl:7.2,date:'2024-02-02'},
      {pair:'TSLA',type:'sell',entry:220,exit:205,pnl:6.8,date:'2024-02-20'}
    ]),
    backtest_data: JSON.stringify({total_trades:445,winning_trades:249,losing_trades:196,avg_win:6.9,avg_loss:3.0,max_consecutive_losses:7})
  },
  {
    id: 12,
    name: 'Turtle Trading System',
    market: 'Crypto',
    timeframe: 'Daily',
    win_rate: 55,
    profit_factor: 3.1,
    max_drawdown: 22.4,
    avg_return: 22.1,
    description: 'The legendary Turtle Trading system adapted for crypto. Buys 20-day highs, sells 20-day lows. Uses ATR-based position sizing and pyramiding. Designed to catch massive trends while cutting losses quickly.',
    rules: JSON.stringify([
      'System 1: Enter long on 20-day high breakout, short on 20-day low',
      'System 2: Enter long on 55-day high breakout for larger moves',
      'Position size: 1% account risk per ATR unit',
      'Add to winners every 0.5 ATR move in your favor (max 4 units)',
      'Exit: 10-day low for System 1, 20-day low for System 2'
    ]),
    pros: JSON.stringify(['Catches massive trends', 'Systematic and emotion-free', 'Proven 40-year track record', 'Works on any liquid market']),
    cons: JSON.stringify(['Low win rate requires discipline', 'Large drawdowns', 'Many small losses', 'Needs large capital for diversification']),
    equity: JSON.stringify([10000,12870,16500,13800,19800,27200,22400,33800,44200,36800,50400,64700]),
    monthly_returns: JSON.stringify([0,28.7,28.2,-16.4,43.5,37.4,-17.6,50.9,30.8,-16.7,37.0,28.4]),
    trades: JSON.stringify([
      {pair:'BTC/USDT',type:'buy',entry:30000,exit:68000,pnl:126.7,date:'2024-01-01'},
      {pair:'ETH/USDT',type:'buy',entry:1500,exit:4000,pnl:166.7,date:'2024-01-15'},
      {pair:'SOL/USDT',type:'buy',entry:20,exit:200,pnl:900.0,date:'2024-01-20'}
    ]),
    backtest_data: JSON.stringify({total_trades:89,winning_trades:37,losing_trades:52,avg_win:28.7,avg_loss:9.2,max_consecutive_losses:12})
  }
];

async function seed() {
  console.log('🌱 Seeding strategies...\n');

  // Clear existing
  const { error: delErr } = await supabase.from('strategies').delete().neq('id', 0);
  if (delErr) console.warn('Could not clear strategies:', delErr.message);

  let count = 0;
  for (const s of strategies) {
    const { error } = await supabase.from('strategies').upsert(s);
    if (error) {
      console.error(`✗ Failed: ${s.name} —`, error.message);
    } else {
      console.log(`✓ ${s.name} (${s.market} · ${s.timeframe}) — Win: ${s.win_rate}% · Avg: +${s.avg_return}%`);
      count++;
    }
  }

  console.log(`\n✅ Done! Seeded ${count}/${strategies.length} strategies.`);
}

seed().catch(err => { console.error('Fatal:', err); process.exit(1); });
