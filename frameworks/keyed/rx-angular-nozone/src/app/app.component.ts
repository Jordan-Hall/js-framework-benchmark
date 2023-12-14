import { RxFor } from '@rx-angular/template/for';
import { ChangeDetectionStrategy, Component, VERSION } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
interface Data {
    id: number;
    label: string;
}

const adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
const colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
const nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];
        

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RxFor],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './app.component.html',
})
export class AppComponent {
    data$: BehaviorSubject<Array<Data>> = new BehaviorSubject<Array<Data>>([]);
    selected$: BehaviorSubject<number | undefined> = new BehaviorSubject<number | undefined>(undefined);
    id: number = 1;
    backup?: Array<Data> = undefined;
    version = VERSION.full;


    buildData(count: number = 1000): Array<Data> {
        return Array.from({ length: count }, () => ({
            id: this.id++,
            label: `${adjectives[this._random(adjectives.length)]} ${colours[this._random(colours.length)]} ${nouns[this._random(nouns.length)]}`
        }));
    }

    _random(max: number) {
        return Math.round(Math.random() * 1000) % max;
    }

    select(item: Data, event: Event) {
        event.preventDefault();
        this.selected$.next(item.id);
    }

    delete(item: Data, event: Event) {
        event.preventDefault();
        const currentData = this.data$.getValue();
        this.data$.next(currentData.filter(d => d.id !== item.id));
    }

    run() {
        this.data$.next(this.buildData());
    }

    add() {
        const currentData = this.data$.getValue();
        this.data$.next([...currentData, ...this.buildData(1000)]);
    }

    update() {
        const updatedData = this.data$.getValue().map((item, index) => {
            return index % 10 === 0 ? { ...item, label: item.label + ' !!!' } : item;
        });
        this.data$.next(updatedData);
    }

    runLots() {
        this.data$.next(this.buildData(10000));
        this.selected$.next(undefined);
    }

    clear() {
        this.data$.next([]);
        this.selected$.next(undefined);
    }

    swapRows() {
        const currentData = this.data$.getValue();
        if (currentData.length > 998) {
            const newData = [...currentData];
            [newData[1], newData[998]] = [newData[998], newData[1]];
            this.data$.next(newData);
        }
    }
}
