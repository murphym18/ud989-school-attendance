/* MODEL CLASSES */
function Person(name, attendance) {
   this.name = name;
   this.attendance = attendance;
}

Person.prototype = {
   countMissing: function() {
      return this.attendance.reduce(function(pre, cur) {
         return pre + (cur ? 1 : 0);
      }, 0);
   }
}

Person.fromPOJSO = function(obj) {
   return new Person(obj.name, obj.attendance);
}

/* DATA ACCESS */
function DataStore() {
   this.models = this.load();
}

DataStore.prototype = {
   load: function() {
      if (!localStorage.attendance) {
         localStorage.attendance = JSON.stringify(defaultData);
      }
      return JSON.parse(localStorage.attendance).map(Person.fromPOJSO);
   },

   save: function() {
      localStorage.attendance = JSON.stringify(this.models);
   },

   at: function(index) {
      return this.models[index]
   },

   get: function(name) {
      for (var i = 0; i < this.models.length; ++i) {
         if (this.models[i].name === name)
            return this.models[i];
      }
   }
}

var octopus = {

   getNumDays: function() {
      return 12;
   },
   getPeople: function() {
      return this.db.models;
   },
   updateAttendance: function(name, day, val) {
      var person = this.db.get(name);
      person.attendance[day] = val;
      this.db.save();
      this.view.render();

   },
   start: function() {
      this.db = new DataStore();
      this.view = new AttendanceTable();
      this.view.render();
   }
}

/* View */
function AttendanceTable() {
   this.el = $('#attendance')[0];
   this.thead = $('#attendance > thead')[0];
   this.tbody = $('#attendance > tbody')[0];
   this.el.addEventListener('click', function(e) {
      var name = e.target.getAttribute('data-person');
      var day = e.target.value;
      var val = e.target.checked;
      octopus.updateAttendance(name, day, val);
   });
}

AttendanceTable.prototype = {
   render: function() {
      this.days = octopus.getNumDays();
      var thead = this.renderHead();
      var tbody = this.renderBody();
      this.el.replaceChild(thead, this.thead);
      this.thead = thead;
      this.el.replaceChild(tbody, this.tbody);
      this.tbody = tbody;
   },
   createEl: function(elm, text, className) {
      var e = document.createElement(elm);
      e.appendChild(document.createTextNode(text));
      e.setAttribute('class', className);
      return e;
   },
   renderHead: function() {
      var tr = document.createElement('tr');
      tr.appendChild(this.createEl('th', 'Student Name', "name-col"));
      for (var day = 1; day <= this.days; ++day) {
         tr.appendChild(this.createEl('th', day, ''));
      }
      tr.appendChild(this.createEl('th', 'Days Missed-col', "missed-col"));
      var thead = document.createElement('thead');
      thead.appendChild(tr);
      return thead;
   },
   renderBody: function() {
      var tbody = document.createElement('tbody');
      var people = octopus.getPeople();
      for (var i = 0; i < people.length; ++i) {
         tbody.appendChild(this.createBodyRow(people[i]));
      }
      return tbody;
   },
   createBodyRow: function(person) {
      var tr = document.createElement('tr');
      tr.appendChild(this.createEl('td', person.name, "name-col"));

      for (var day = 0; day < this.days; ++day) {
         var input = document.createElement('input');
         input.setAttribute('type', 'checkbox');
         input.setAttribute('data-person', person.name);
         input.checked = person.attendance[day];
         input.value = day;

         var td = document.createElement('td');
         td.appendChild(input);
         tr.appendChild(td);
      }

      tr.appendChild(this.createEl('td', this.days - person.countMissing(),
         "missed-col"));
      return tr;
   }
}

$(function() {
   octopus.start();
}());
