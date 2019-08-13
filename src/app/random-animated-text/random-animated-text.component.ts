import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-random-animated-text',
  templateUrl: './random-animated-text.component.html',
  styleUrls: ['./random-animated-text.component.css']
})
export class RandomAnimatedTextComponent implements OnInit {
  @Input() symbols: string|string[] = 'abcABC';
  @Input() speed: number = 500;
  @Input() count: number = 3;

  text: string = '';
  private textIndex: number = 0;
  constructor() { }

  ngOnInit() {
    for (let i = 0; i < this.count; i++) {
      let c = this.symbols[Math.floor(Math.random() * this.symbols.length)];
      this.text+=c;
    }

    this.refresh();
  }
  private refresh() {
    let currentValue = [...this.text];
    //this.text = '';
    //for (let i = 0; i < this.count; i++) {
    
    let c = this.symbols[Math.floor(Math.random() * this.symbols.length)];
    currentValue[this.textIndex++] = c;
    //}
    if (this.textIndex >= this.count)
      this.textIndex = 0;
    this.text = currentValue.join('');
    setTimeout(() => {
      this.refresh();
    }, this.speed);
  }

  //public ngAfterContentInit(): void {
  //}
}
