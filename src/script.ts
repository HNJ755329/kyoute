// DOM 要素の型定義
interface DOMElements {
  yourScoreInput: HTMLInputElement;
  avgScoreInput: HTMLInputElement;
  stdDevInput: HTMLInputElement;
  calcBtn: HTMLButtonElement;
  deviationDisplay: HTMLElement;
  evaluationMessage: HTMLElement;
  extraInfoSpan: HTMLElement;
  showVarianceHint: HTMLElement;
  errorWarnSpan: HTMLElement;
}

// 計算結果の型定義
interface CalculationResult {
  deviation: number;
  rankMessage: string;
  extraComment: string;
}

// バリデーション結果の型定義
interface ValidationResult {
  isValid: boolean;
  errorMessage: string;
}

class DeviationCalculator {
  private elements: DOMElements;

  constructor() {
    // DOM 要素の取得と型アサーション
    this.elements = {
      yourScoreInput: document.getElementById('yourScore') as HTMLInputElement,
      avgScoreInput: document.getElementById('avgScore') as HTMLInputElement,
      stdDevInput: document.getElementById('stdDev') as HTMLInputElement,
      calcBtn: document.getElementById('calcBtn') as HTMLButtonElement,
      deviationDisplay: document.getElementById('deviationDisplay') as HTMLElement,
      evaluationMessage: document.getElementById('evaluationMessage') as HTMLElement,
      extraInfoSpan: document.getElementById('extraInfo') as HTMLElement,
      showVarianceHint: document.getElementById('showVarianceHint') as HTMLElement,
      errorWarnSpan: document.getElementById('errorWarn') as HTMLElement
    };

    this.initializeEventListeners();
    this.refreshStatsAndWarnings();
    this.calculateDeviation(); // 初期表示の計算
  }

  // 分散ヒントの更新
  private updateVarianceHint(): void {
    const stdVal = parseFloat(this.elements.stdDevInput.value);
    if (isNaN(stdVal)) {
      this.elements.showVarianceHint.innerText = '分散: (標準偏差が無効)';
      return;
    }
    const variance = stdVal * stdVal;
    this.elements.showVarianceHint.innerText = `分散: ${variance.toFixed(2)}  (σ = ${stdVal.toFixed(2)})`;
  }

  // 標準偏差のバリデーション
  private validateStdDev(): boolean {
    const std = parseFloat(this.elements.stdDevInput.value);
    if (isNaN(std) || std <= 0) {
      if (std === 0) {
        this.elements.errorWarnSpan.innerText = "⚠️ 標準偏差が0だと計算不能です。正の値を設定してください。";
      } else if (std < 0) {
        this.elements.errorWarnSpan.innerText = "⚠️ 標準偏差は正の数にしてください";
      } else {
        this.elements.errorWarnSpan.innerText = "⚠️ 標準偏差を数値で入力 (正の数)";
      }
      return false;
    } else {
      this.elements.errorWarnSpan.innerText = "";
      return true;
    }
  }

  // 入力値のバリデーション
  private validateInputs(): ValidationResult {
    const yourScore = parseFloat(this.elements.yourScoreInput.value);
    const mean = parseFloat(this.elements.avgScoreInput.value);
    const sd = parseFloat(this.elements.stdDevInput.value);

    if (isNaN(yourScore)) {
      return { isValid: false, errorMessage: "あなたの得点を半角数字で入力してください。" };
    }
    if (isNaN(mean)) {
      return { isValid: false, errorMessage: "平均点を正しく入力してください。" };
    }
    if (isNaN(sd)) {
      return { isValid: false, errorMessage: "標準偏差を数値で入力してください。" };
    }
    if (sd <= 0) {
      return { isValid: false, errorMessage: "標準偏差は0より大きい正の数を設定してください。" };
    }

    return { isValid: true, errorMessage: "" };
  }

  // 偏差値から評価メッセージを生成
  private getEvaluationMessage(deviation: number): { rankMessage: string; extraComment: string } {
    if (deviation >= 80) {
      return {
        rankMessage: "🎉 トップレベル (SSランク) 圧倒的な実力！",
        extraComment: "全国トップクラスの学力です。自信を持って挑んでください。"
      };
    } else if (deviation >= 70) {
      return {
        rankMessage: "🏆 優秀 (Sランク) 非常に高い偏差値",
        extraComment: "難関大学も視野に入る好成績です。"
      };
    } else if (deviation >= 60) {
      return {
        rankMessage: "⭐ 上位 (Aランク) しっかり成果が出ています",
        extraComment: "志望校合格に向けて好調です。"
      };
    } else if (deviation >= 50) {
      return {
        rankMessage: "📘 平均的 (Bランク) 安定した位置",
        extraComment: "全国平均付近。さらなる伸びを目指しましょう。"
      };
    } else if (deviation >= 40) {
      return {
        rankMessage: "🌱 やや下位 (Cランク) 基礎固めが必要かも",
        extraComment: "弱点を分析して学習計画を見直すと効果的。"
      };
    } else if (deviation >= 30) {
      return {
        rankMessage: "📉 要努力 (Dランク) 底上げチャンス",
        extraComment: "基礎を中心に繰り返し復習しましょう。"
      };
    } else {
      return {
        rankMessage: "💪 再チャレンジ (Eランク) まだまだ伸びしろ大",
        extraComment: "諦めずに過去問分析＋苦手対策で大幅UP可能。"
      };
    }
  }

  // 偏差値計算のメインロジック
  public calculateDeviation(): void {
    // 入力値の取得
    const yourScore = parseFloat(this.elements.yourScoreInput.value);
    const mean = parseFloat(this.elements.avgScoreInput.value);
    const sd = parseFloat(this.elements.stdDevInput.value);

    // バリデーション
    const validation = this.validateInputs();
    if (!validation.isValid) {
      this.elements.deviationDisplay.innerText = "? ERR";
      this.elements.evaluationMessage.innerText = "入力エラー";
      this.elements.extraInfoSpan.innerText = validation.errorMessage;
      return;
    }

    // 偏差値計算式: 50 + 10 * (得点 - 平均) / 標準偏差
    let deviation = 50 + 10 * ((yourScore - mean) / sd);
    // 小数点以下1桁まで表示
    const deviationRounded = Math.round(deviation * 10) / 10;

    // 表示
    this.elements.deviationDisplay.innerText = deviationRounded.toFixed(1);

    // 評価メッセージの取得
    const { rankMessage, extraComment } = this.getEvaluationMessage(deviation);

    // 得点と平均の差を計算
    const diff = yourScore - mean;
    const diffSign = diff >= 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`;
    const diffComment = diff >= 0 ? "平均より上" : "平均より下";

    this.elements.evaluationMessage.innerText = rankMessage;
    this.elements.extraInfoSpan.innerHTML = `📊 得点 ${yourScore.toFixed(1)}点 / 平均 ${mean.toFixed(1)}点 (${diffSign}点, ${diffComment})<br>✨ ${extraComment}`;
  }

  // 統計情報の表示更新（分散ヒントと警告）
  public refreshStatsAndWarnings(): void {
    this.updateVarianceHint();
    this.validateStdDev();
  }

  // イベントリスナーの初期化
  private initializeEventListeners(): void {
    // 入力フィールド変更時のヒント更新
    this.elements.avgScoreInput.addEventListener('input', () => {
      this.refreshStatsAndWarnings();
    });

    this.elements.stdDevInput.addEventListener('input', () => {
      this.refreshStatsAndWarnings();
    });

    // 計算ボタンのクリックイベント
    this.elements.calcBtn.addEventListener('click', () => {
      this.refreshStatsAndWarnings();

      // 追加の標準偏差チェック
      const sdValue = parseFloat(this.elements.stdDevInput.value);
      if (isNaN(sdValue) || sdValue <= 0) {
        this.elements.deviationDisplay.innerText = "ERROR";
        this.elements.evaluationMessage.innerText = "標準偏差を正の値にしてください";
        this.elements.extraInfoSpan.innerHTML = "標準偏差が0または不正な値です。正の数値（例: 15.2）を入力してください。";
        return;
      }

      const meanVal = parseFloat(this.elements.avgScoreInput.value);
      if (isNaN(meanVal)) {
        this.elements.deviationDisplay.innerText = "ERROR";
        this.elements.evaluationMessage.innerText = "平均点が不正です";
        this.elements.extraInfoSpan.innerHTML = "過去の平均点を半角数字で入力してください。";
        return;
      }

      const yourVal = parseFloat(this.elements.yourScoreInput.value);
      if (isNaN(yourVal)) {
        this.elements.deviationDisplay.innerText = "?";
        this.elements.evaluationMessage.innerText = "得点を正しく入力";
        this.elements.extraInfoSpan.innerHTML = "あなたの得点に数字を入力してください（小数点も可）";
        return;
      }

      this.calculateDeviation();
    });

    // Enterキーでの計算対応
    const inputs = [this.elements.yourScoreInput, this.elements.avgScoreInput, this.elements.stdDevInput];
    inputs.forEach(input => {
      input.addEventListener('keypress', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.elements.calcBtn.click();
        }
      });
    });
  }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
  new DeviationCalculator();
});
