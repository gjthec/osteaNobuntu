import { Component, Input, OnInit, Inject, Optional } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslocoService } from '@ngneat/transloco';
import { CommunicationService } from 'app/shared/communication.service';
import { ItemBase } from 'app/shared/models/item-base.module';
import {DIALOG_DATA} from '@angular/cdk/dialog';

enum FilterTypes {
  filterNumberWithConditions,
  filterDate,
  filterTextWithConditions,
  filterBoolean
}

interface SelectedFilter { //TODO change name to Filter
  index:number,
  value: string,
  selectedFilterOption:number,
  condition: FormControl<Condition>,
  filterValue: any
}

enum Condition {
  and = "and",
  or = "or"
}


@Component({
  selector: 'app-base-resource-filter',
  templateUrl: './base-resource-filter.component.html',
  styleUrls: ['./base-resource-filter.component.scss']
})
export class BaseResourceFilterComponent implements OnInit{
  selectedfield: string;
  selectedFilters: SelectedFilter[] = [];
  variables: ItemBase[];
  
  constructor(private translocoService: TranslocoService, 
    private dialogBaseResourceFilterComponentRef: MatDialogRef<BaseResourceFilterComponent>,
    @Optional() @Inject(DIALOG_DATA) private dialogData:{itemBaseStructure, submitFindCustom: Function}){}
 
  ngOnInit(): void {
    this.variables = this.dialogData.itemBaseStructure;
  }
  
  addNewFilter(){
    this.selectedFilters.push({index: this.selectedFilters.length+1, value:this.variables[0].name, selectedFilterOption: FilterTypes.filterDate, condition: new FormControl<Condition>(Condition.and), filterValue: null });
  }

  removeFilter(){
    this.selectedFilters.pop();
  }

  onSelectedFieldChange(selectedField: {name: string, type: string, value: any}, _selectedFilter: number){
    
    const filterModified = this.selectedFilters.find((selectedFilter) => selectedFilter.index == _selectedFilter);

    if(selectedField.type == "string"){
      filterModified.selectedFilterOption = FilterTypes.filterTextWithConditions;
    } else if(selectedField.type == "number"){
      filterModified.selectedFilterOption  = FilterTypes.filterNumberWithConditions;
    } else if(selectedField.type == "boolean"){
      filterModified.selectedFilterOption = FilterTypes.filterBoolean;
    } else if(selectedField.type == "Date"){
      filterModified.selectedFilterOption  = FilterTypes.filterDate;
    }

  }

  changeParametersFilter(){
    
  }

  getAllSearchParameters(): { filterValues: any[], conditions: any[] }{
    let returned_values = {
      filterValues: [],
      conditions: []
    }
    
    this.selectedFilters.forEach(filter => {
      
      if(filter.index < this.selectedFilters.length){
        returned_values.filterValues.push({filterParameter: filter.filterValue, variableInfo: filter.value});
        returned_values.conditions.push(filter.condition.value);
        // console.log(filter.filterValue);
        // console.log(filter.condition.value);
        
      } else {
        // console.log(filter.filterValue);
        returned_values.filterValues.push({filterParameter: filter.filterValue, variableInfo: filter.value});
      }
      
    });
    
    return returned_values;
  }

  applyFilters(){
    this.dialogData.submitFindCustom(this.getAllSearchParameters());
  }

  getChildData(filterIndex: number, newItem: string) {
    let filter = this.selectedFilters.find((filter)=> filter.index == filterIndex);
    filter.filterValue = newItem;
  }

  closeThisDialog(){
    this.dialogBaseResourceFilterComponentRef.close(this.getAllSearchParameters());
  }

}
