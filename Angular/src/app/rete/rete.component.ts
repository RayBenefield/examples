import {
  Component, AfterViewInit,
  OnChanges, ViewChild,
  ElementRef, Input, ViewEncapsulation
} from '@angular/core';

import { NodeEditor, Engine } from 'rete';
import * as ConnectionPlugin from 'rete-alight-render-plugin';
import * as AlightRenderPlugin from 'rete-connection-plugin';
import { NumComponent } from './components/number-component';
import { AddComponent } from './components/add-component';

@Component({
    selector: 'app-rete',
    template: '<div class="wrapper"><div #nodeEditor class="node-editor"></div></div>',
    styleUrls: ['./rete.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class ReteComponent implements AfterViewInit {

  @ViewChild('nodeEditor') el: ElementRef;
  editor = null;

  async ngAfterViewInit() {
    const self = this;

    const container = this.el.nativeElement;

    const components = [new NumComponent(), new AddComponent()];

    const editor = new NodeEditor('demo@0.1.0', container);
    editor.use(ConnectionPlugin, { curvature: 0.4 });
    editor.use(AlightRenderPlugin);

    const engine = new Engine('demo@0.1.0');

    components.map(c => {
      editor.register(c);
      engine.register(c);
    });

    const n1 = await components[0].createNode({ num: 2 });
    const n2 = await components[0].createNode({ num: 0 });
    const add = await components[1].createNode();

    n1.position = [80, 200];
    n2.position = [80, 400];
    add.position = [500, 240];

    editor.addNode(n1);
    editor.addNode(n2);
    editor.addNode(add);

    editor.connect(n1.outputs[0], add.inputs[0]);
    editor.connect(n2.outputs[0], add.inputs[1]);


    editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
      await engine.abort();
      await engine.process(editor.toJSON());
    });

    editor.view.resize();
    editor.trigger('process');
  }
}