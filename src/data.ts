class MeanStd {
  constructor() {
    mean: Number;
    stdv: Number;
  }
}

class Exam {
  constructor() {
    english: MeanStd;
    japanese: MeanStd;
    math1a: MeanStd;
    math2b: MeanStd;
    science: MeanStd;
    geography: MeanStd;
  }
}

class PastExams {
  constructor() {
    exams: [Exam];
  }
}

function init() {
};
