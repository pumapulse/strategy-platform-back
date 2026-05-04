require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const strategies = [
  {
    id: 1, name: 'Breakout Momentum', market: 'Crypto', timeframe: '4H',
    win_rate: 65, profit_factor: 2.3, max_drawdown: 8.2, avg_return: 12.4,
    description: 'Identifies price consolidation zones and enters on confirmed breakouts with volume surge. Works best on BTC/USDT and ETH/USDT during trending markets. Uses ATR-based stops to filter noise.',
    rules: JSON.stringify(['Wait for price to consolidate for at least 8 candles (ATR < 0.8%)','Enter on first candle closing above range high with volume > 1.5x 20-period average','Set stop-loss 1 ATR below breakout candle low','Take 50% profit at 2R, move stop to breakeven','Trail remaining position with 2 ATR trailing stop']),
    pros: JSON.stringify(['High reward-to-risk ratio','Clear entry and exit rules','Works in trending markets','Easy to automate']),
    cons: JSON.stringify(['Whipsaws in ranging markets','Requires volume confirmation','Less effective on low-cap coins']),
    equity: JSON.stringify([10000,10840,11200,10900,12300,13800,13100,16000,18100,16800,20900,24100]),
    monthly_returns: JSON.stringify([0,8.4,3.3,-2.7,12.8,12.2,-5.1,22.1,13.1,-7.2,24.4,15.3]),
    trades: JSON.stringify([{pair:'BTC/USDT',type:'buy',entry:42000,exit:46200,pnl:10.0,date:'2024-01-15'},{pair:'ETH/USDT',type:'buy',entry:2200,exit:2530,pnl:15.0,date:'2024-01-28'},{pair:'SOL/USDT',type:'buy',entry:95,exit:88,pnl:-7.4,date:'2024-02-10'}]),
    backtest_data: JSON.stringify({total_trades:247,winning_trades:160,losing_trades:87,avg_win:12.4,avg_loss:4.2,max_consecutive_losses:5})
  },
  {
    id: 2, name: 'RSI Mean Reversion', market: 'Crypto', timeframe: '1H',
    win_rate: 67, profit_factor: 2.0, max_drawdown: 7.4, avg_return: 6.8,
    description: 'Exploits oversold/overbought conditions using RSI divergence combined with key support/resistance levels. Enters counter-trend positions when RSI shows hidden divergence at major levels.',
    rules: JSON.stringify(['RSI(14) must be below 30 (oversold) or above 70 (overbought)','Look for bullish/bearish divergence between price and RSI','Entry only at key support/resistance or Fibonacci levels','Stop-loss below/above the swing low/high','Target previous swing high/low for take profit']),
    pros: JSON.stringify(['High win rate','Works in ranging markets','Clear invalidation levels','Multiple timeframe confirmation']),
    cons: JSON.stringify(['Lower reward-to-risk','Can miss strong trends','Requires patience for setups']),
    equity: JSON.stringify([10000,10520,11100,10800,11900,12800,12400,14200,15600,14900,17100,19200]),
    monthly_returns: JSON.stringify([0,5.2,5.5,-2.7,10.2,7.6,-3.1,14.5,9.9,-4.5,14.8,12.3]),
    trades: JSON.stringify([{pair:'ETH/USDT',type:'buy',entry:1800,exit:1980,pnl:10.0,date:'2024-01-08'},{pair:'BNB/USDT',type:'sell',entry:320,exit:295,pnl:7.8,date:'2024-01-19'},{pair:'BTC/USDT',type:'buy',entry:38000,exit:41200,pnl:8.4,date:'2024-02-05'}]),
    backtest_data: JSON.stringify({total_trades:312,winning_trades:209,losing_trades:103,avg_win:6.8,avg_loss:2.8,max_consecutive_losses:5})
  },
  {
    id: 3, name: 'On-Chain Volume Surge', market: 'Crypto', timeframe: '1H',
    win_rate: 63, profit_factor: 1.9, max_drawdown: 6.8, avg_return: 7.2,
    description: 'Detects abnormal on-chain volume spikes combined with price breakouts on 1H timeframe. Enters when volume exceeds 2x the 20-period average with a bullish candle close above the previous high. Best on BTC and ETH.',
    rules: JSON.stringify(['Volume must exceed 2x the 20-period average','Price must close above previous 4H high','RSI between 50-70 on entry','Stop-loss 1.5% below entry candle low','Target 3% minimum (2:1 R:R)']),
    pros: JSON.stringify(['High-frequency setups','Volume confirms moves','Works on liquid pairs','Clear entry trigger']),
    cons: JSON.stringify(['Requires volume data feed','False spikes in low-liquidity hours','Less effective on altcoins']),
    equity: JSON.stringify([10000,10680,11200,10820,11800,12600,12100,13400,14200,13700,15100,16200]),
    monthly_returns: JSON.stringify([0,6.8,4.8,-3.4,9.1,6.8,-4.1,10.7,6.0,-3.5,10.2,7.3]),
    trades: JSON.stringify([{pair:'BTC/USDT',type:'buy',entry:42000,exit:43260,pnl:3.0,date:'2024-01-10'},{pair:'ETH/USDT',type:'buy',entry:2200,exit:2350,pnl:6.8,date:'2024-01-22'},{pair:'SOL/USDT',type:'buy',entry:95,exit:102,pnl:7.4,date:'2024-02-05'}]),
    backtest_data: JSON.stringify({total_trades:412,winning_trades:260,losing_trades:152,avg_win:7.2,avg_loss:3.1,max_consecutive_losses:6})
  },
  {
    id: 4, name: 'Funding Rate Arbitrage', market: 'Crypto', timeframe: '4H',
    win_rate: 67, profit_factor: 2.3, max_drawdown: 8.6, avg_return: 11.8,
    description: 'Exploits extreme funding rates on perpetual futures. When funding rate exceeds +0.1% (longs paying shorts), opens short positions expecting price correction. When below -0.05%, opens longs. Combines with RSI for timing.',
    rules: JSON.stringify(['Funding rate must exceed +0.1% for short entries','Funding rate below -0.05% for long entries','RSI confirmation: >70 for shorts, <30 for longs','Enter at 4H candle close after funding spike','Stop-loss 2% beyond entry, target 4%']),
    pros: JSON.stringify(['Unique edge from derivatives market','Mean-reverting signal','Works in all market conditions','Quantifiable entry criteria']),
    cons: JSON.stringify(['Requires perpetual futures access','Funding can stay extreme','Exchange-specific data needed','Less effective on small caps']),
    equity: JSON.stringify([10000,11120,12380,11600,13400,15200,14200,16800,19200,17800,21400,25200]),
    monthly_returns: JSON.stringify([0,11.2,11.3,-6.3,15.5,13.4,-6.6,18.3,14.3,-7.3,20.2,17.8]),
    trades: JSON.stringify([{pair:'BTC/USDT',type:'sell',entry:48000,exit:45600,pnl:5.0,date:'2024-01-15'},{pair:'ETH/USDT',type:'buy',entry:2100,exit:2352,pnl:12.0,date:'2024-02-08'},{pair:'BTC/USDT',type:'sell',entry:52000,exit:49400,pnl:5.0,date:'2024-02-25'}]),
    backtest_data: JSON.stringify({total_trades:178,winning_trades:119,losing_trades:59,avg_win:11.8,avg_loss:4.8,max_consecutive_losses:5})
  },
  {
    id: 5, name: 'EMA Crossover Trend', market: 'Crypto', timeframe: 'Daily',
    win_rate: 58, profit_factor: 2.8, max_drawdown: 16.4, avg_return: 19.8,
    description: 'Classic EMA 20/50/200 crossover system adapted for crypto markets. Uses the golden/death cross on daily timeframe with volume confirmation. Holds positions for weeks to months.',
    rules: JSON.stringify(['EMA 20 crosses above EMA 50 (golden cross) — go long','EMA 20 crosses below EMA 50 (death cross) — go short or exit','Price must be above EMA 200 for longs, below for shorts','Volume on crossover day must be above 30-day average','Hold until opposite crossover or 15% trailing stop hit']),
    pros: JSON.stringify(['Catches major trends','Simple rules','Low maintenance','Proven over decades']),
    cons: JSON.stringify(['Late entries','Large drawdowns','Many false signals in ranging markets','Requires patience']),
    equity: JSON.stringify([10000,12240,14800,13200,17600,22400,19800,27200,34100,29800,38900,47200]),
    monthly_returns: JSON.stringify([0,22.4,20.9,-10.8,33.3,27.3,-11.6,37.4,25.4,-12.6,30.5,21.3]),
    trades: JSON.stringify([{pair:'BTC/USDT',type:'buy',entry:28000,exit:48000,pnl:71.4,date:'2024-01-01'},{pair:'ETH/USDT',type:'buy',entry:1600,exit:3200,pnl:100.0,date:'2024-01-15'},{pair:'SOL/USDT',type:'buy',entry:60,exit:180,pnl:200.0,date:'2024-02-01'}]),
    backtest_data: JSON.stringify({total_trades:67,winning_trades:39,losing_trades:28,avg_win:19.8,avg_loss:7.4,max_consecutive_losses:8})
  },
  {
    id: 6, name: 'Bollinger Band Squeeze', market: 'Crypto', timeframe: '4H',
    win_rate: 60, profit_factor: 2.1, max_drawdown: 9.2, avg_return: 8.4,
    description: 'Identifies periods of low volatility (squeeze) followed by explosive breakouts. Uses Bollinger Band width to detect compression, then enters on the first directional candle after expansion.',
    rules: JSON.stringify(['Bollinger Band width must be at 6-month low (squeeze)','Wait for bands to start expanding','Enter long if first expansion candle is bullish with close above upper band','Enter short if first expansion candle is bearish with close below lower band','Stop-loss at middle band (20 EMA), target 2x band width']),
    pros: JSON.stringify(['Explosive moves after squeeze','Clear entry trigger','Works on all markets','Good risk/reward']),
    cons: JSON.stringify(['False breakouts common','Requires patience during squeeze','Can miss entry on fast moves']),
    equity: JSON.stringify([10000,10760,11380,10920,12200,13400,12800,14900,16300,15600,17800,19700]),
    monthly_returns: JSON.stringify([0,7.6,5.8,-4.0,11.7,9.8,-4.5,16.4,9.4,-4.3,14.1,10.7]),
    trades: JSON.stringify([{pair:'BTC/USDT',type:'buy',entry:43000,exit:47300,pnl:10.0,date:'2024-01-20'},{pair:'ETH/USDT',type:'buy',entry:2100,exit:2420,pnl:15.2,date:'2024-02-14'},{pair:'AVAX/USDT',type:'buy',entry:35,exit:42,pnl:20.0,date:'2024-03-01'}]),
    backtest_data: JSON.stringify({total_trades:189,winning_trades:113,losing_trades:76,avg_win:8.4,avg_loss:3.6,max_consecutive_losses:6})
  },
  {
    id: 7, name: 'Altcoin Season Rotator', market: 'Crypto', timeframe: '4H',
    win_rate: 62, profit_factor: 2.2, max_drawdown: 13.6, avg_return: 17.8,
    description: 'Rotates capital into top-performing altcoins during altcoin season using BTC dominance as a filter. Enters altcoins when BTC.D drops below its 20-day EMA and the altcoin shows relative strength vs BTC.',
    rules: JSON.stringify(['BTC dominance must be below its 20-day EMA','Altcoin must show positive RSI divergence vs BTC','Volume on altcoin must be 1.5x its 20-period average','Enter on 4H close above 10-day high','Stop-loss at 10-day low, target 2x entry move']),
    pros: JSON.stringify(['Captures altcoin season moves','BTC dominance filter reduces risk','Relative strength focus','High return potential']),
    cons: JSON.stringify(['Altcoin season timing is uncertain','Higher volatility','Liquidity risk on small caps','Requires multiple pair monitoring']),
    equity: JSON.stringify([10000,10820,11640,10800,12600,14200,13100,15800,18200,16400,20100,23800]),
    monthly_returns: JSON.stringify([0,8.2,7.6,-7.2,16.7,12.7,-7.7,20.6,15.2,-9.9,22.6,18.4]),
    trades: JSON.stringify([{pair:'SOL/USDT',type:'buy',entry:80,exit:112,pnl:40.0,date:'2024-01-18'},{pair:'AVAX/USDT',type:'buy',entry:28,exit:38,pnl:35.7,date:'2024-02-10'},{pair:'LINK/USDT',type:'buy',entry:14,exit:19,pnl:35.7,date:'2024-03-01'}]),
    backtest_data: JSON.stringify({total_trades:156,winning_trades:97,losing_trades:59,avg_win:17.8,avg_loss:7.2,max_consecutive_losses:6})
  },
  {
    id: 8, name: 'MACD Divergence', market: 'Crypto', timeframe: '4H',
    win_rate: 60, profit_factor: 2.2, max_drawdown: 9.8, avg_return: 10.2,
    description: 'Trades regular and hidden MACD divergences at key market structure levels. Regular divergence signals reversals, hidden divergence signals trend continuation. Uses histogram for timing.',
    rules: JSON.stringify(['Identify regular divergence: price makes new high/low but MACD does not','Hidden divergence: price makes higher low but MACD makes lower low (bullish)','Entry on MACD histogram flip (from negative to positive or vice versa)','Must occur at key support/resistance or Fibonacci level','Stop beyond the divergence swing, target 2:1 minimum']),
    pros: JSON.stringify(['Early reversal signals','Works on trending and ranging markets','Clear histogram trigger','High reward potential']),
    cons: JSON.stringify(['Can diverge for extended periods','Requires context reading','False signals in strong trends']),
    equity: JSON.stringify([10000,10930,11800,11200,13000,14900,14000,16800,19000,17800,21400,24800]),
    monthly_returns: JSON.stringify([0,9.3,8.0,-5.1,16.1,14.6,-6.0,20.0,13.1,-6.3,20.2,15.9]),
    trades: JSON.stringify([{pair:'BTC/USDT',type:'buy',entry:40000,exit:44500,pnl:11.3,date:'2024-01-18'},{pair:'ETH/USDT',type:'sell',entry:2800,exit:2520,pnl:10.0,date:'2024-02-05'},{pair:'LINK/USDT',type:'buy',entry:14,exit:17.5,pnl:25.0,date:'2024-02-25'}]),
    backtest_data: JSON.stringify({total_trades:203,winning_trades:122,losing_trades:81,avg_win:10.2,avg_loss:4.0,max_consecutive_losses:6})
  },
  {
    id: 9, name: 'Whale Wallet Tracker', market: 'Crypto', timeframe: 'Daily',
    win_rate: 60, profit_factor: 2.4, max_drawdown: 12.4, avg_return: 15.6,
    description: 'Follows large wallet movements on-chain to predict price direction. When wallets holding >1000 BTC accumulate (net inflow to cold wallets), enters long. Combines whale signals with daily EMA trend filter.',
    rules: JSON.stringify(['Net whale accumulation: >500 BTC moved to cold wallets in 24h','Price must be above 50-day EMA for longs','RSI must be below 60 on entry (not overbought)','Enter at daily close after whale signal','Stop-loss 5% below entry, target 10%']),
    pros: JSON.stringify(['Follows smart money','On-chain data is transparent','Works on BTC and ETH','Leading indicator']),
    cons: JSON.stringify(['Requires on-chain data provider','Whales can fake movements','Slow signal generation','Less effective on altcoins']),
    equity: JSON.stringify([10000,11080,12360,11500,13600,15800,14600,17400,20200,18600,22400,26800]),
    monthly_returns: JSON.stringify([0,10.8,11.6,-7.0,18.3,16.2,-7.6,19.2,16.1,-8.0,20.4,19.6]),
    trades: JSON.stringify([{pair:'BTC/USDT',type:'buy',entry:38000,exit:43700,pnl:15.0,date:'2024-01-20'},{pair:'ETH/USDT',type:'buy',entry:2000,exit:2340,pnl:17.0,date:'2024-02-12'},{pair:'BTC/USDT',type:'sell',entry:52000,exit:47840,pnl:8.0,date:'2024-03-08'}]),
    backtest_data: JSON.stringify({total_trades:112,winning_trades:67,losing_trades:45,avg_win:15.6,avg_loss:5.8,max_consecutive_losses:7})
  },
  {
    id: 10, name: 'ML Momentum Scanner', market: 'Crypto', timeframe: '4H',
    win_rate: 70, profit_factor: 3.2, max_drawdown: 7.8, avg_return: 15.4,
    description: 'Machine learning-enhanced momentum strategy that combines 12 technical indicators to score momentum strength. Uses gradient boosting to predict next-candle direction with 71% accuracy on backtests.',
    rules: JSON.stringify(['ML score must be above 0.75 (out of 1.0) for long, below 0.25 for short','Momentum confirmed by: RSI > 55, MACD positive, price above EMA 20','Volume must be in top 20% of 50-period range','Enter at market open of next candle after signal','Dynamic stop-loss based on ATR(14) x 1.5, target ATR x 3']),
    pros: JSON.stringify(['Highest win rate in portfolio','Multi-indicator confirmation','Adaptive to market conditions','Quantified entry criteria']),
    cons: JSON.stringify(['Complex to replicate manually','Requires backtesting software','Overfitting risk if not validated']),
    equity: JSON.stringify([10000,11470,13140,12500,15300,18200,17100,21400,25600,23800,29400,35200]),
    monthly_returns: JSON.stringify([0,14.7,14.6,-4.9,22.4,19.0,-6.0,25.1,19.6,-7.0,23.5,19.7]),
    trades: JSON.stringify([{pair:'BTC/USDT',type:'buy',entry:44000,exit:51000,pnl:15.9,date:'2024-01-25'},{pair:'ETH/USDT',type:'buy',entry:2300,exit:2760,pnl:20.0,date:'2024-02-08'},{pair:'SOL/USDT',type:'buy',entry:100,exit:128,pnl:28.0,date:'2024-02-20'}]),
    backtest_data: JSON.stringify({total_trades:289,winning_trades:202,losing_trades:87,avg_win:15.4,avg_loss:4.2,max_consecutive_losses:4})
  },
  {
    id: 11, name: 'DeFi Liquidity Pool Signal', market: 'Crypto', timeframe: '4H',
    win_rate: 62, profit_factor: 2.1, max_drawdown: 10.8, avg_return: 14.2,
    description: 'Monitors DeFi protocol TVL changes and liquidity pool flows to predict price movements. Large TVL inflows signal accumulation; outflows signal distribution. Combines with 4H price action for entry timing.',
    rules: JSON.stringify(['TVL must increase >5% in 24h for long entries','TVL decrease >5% in 24h for short entries','Price must confirm with breakout above/below 4H range','Volume must be above 20-period average','Stop-loss 2.5% from entry, target 5%']),
    pros: JSON.stringify(['Unique DeFi-native signal','TVL is hard to fake','Works on ETH and DeFi tokens','Combines on-chain and price action']),
    cons: JSON.stringify(['Requires DeFi data feed','TVL can be manipulated','Limited to DeFi tokens','Slower signal generation']),
    equity: JSON.stringify([10000,10820,11560,11000,12200,13400,12800,14400,15800,15000,16800,18400]),
    monthly_returns: JSON.stringify([0,8.2,6.8,-4.8,10.9,9.8,-4.5,12.5,9.7,-5.1,12.0,9.5]),
    trades: JSON.stringify([{pair:'ETH/USDT',type:'buy',entry:2200,exit:2420,pnl:10.0,date:'2024-01-14'},{pair:'UNI/USDT',type:'buy',entry:6.5,exit:7.8,pnl:20.0,date:'2024-02-01'},{pair:'AAVE/USDT',type:'buy',entry:95,exit:114,pnl:20.0,date:'2024-02-20'}]),
    backtest_data: JSON.stringify({total_trades:234,winning_trades:145,losing_trades:89,avg_win:14.2,avg_loss:5.8,max_consecutive_losses:6})
  },
  {
    id: 12, name: 'Turtle Trading System', market: 'Crypto', timeframe: 'Daily',
    win_rate: 42, profit_factor: 2.1, max_drawdown: 22.4, avg_return: 18.6,
    description: 'The legendary Turtle Trading system adapted for crypto. Buys 20-day highs, sells 20-day lows. Uses ATR-based position sizing and pyramiding. Designed to catch massive trends while cutting losses quickly.',
    rules: JSON.stringify(['System 1: Enter long on 20-day high breakout, short on 20-day low','System 2: Enter long on 55-day high breakout for larger moves','Position size: 1% account risk per ATR unit','Add to winners every 0.5 ATR move in your favor (max 4 units)','Exit: 10-day low for System 1, 20-day low for System 2']),
    pros: JSON.stringify(['Catches massive trends','Systematic and emotion-free','Proven 40-year track record','Works on any liquid market']),
    cons: JSON.stringify(['Low win rate requires discipline','Large drawdowns','Many small losses','Needs large capital for diversification']),
    equity: JSON.stringify([10000,10800,11900,10600,12400,14100,12800,15200,17800,15900,19400,22800]),
    monthly_returns: JSON.stringify([0,8.0,10.2,-10.9,17.0,13.7,-9.2,18.8,17.1,-10.7,22.0,17.5]),
    trades: JSON.stringify([{pair:'BTC/USDT',type:'buy',entry:30000,exit:38400,pnl:28.0,date:'2024-01-01'},{pair:'ETH/USDT',type:'buy',entry:1500,exit:2100,pnl:40.0,date:'2024-01-15'},{pair:'SOL/USDT',type:'buy',entry:20,exit:28,pnl:40.0,date:'2024-01-20'}]),
    backtest_data: JSON.stringify({total_trades:89,winning_trades:49,losing_trades:40,avg_win:24.6,avg_loss:8.8,max_consecutive_losses:10})
  }
];

async function seed() {
  console.log('🌱 Seeding strategies (all crypto)...\n');
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
