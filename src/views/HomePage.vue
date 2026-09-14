<template>

  <ion-page>

    <!-- HEADER -->

    <ion-header>

      <ion-toolbar color="primary">

        <ion-title>
          Student CRUD
        </ion-title>

      </ion-toolbar>

    </ion-header>


    <ion-content class="ion-padding">


      <!-- FIREBASE CONNECTION STATUS -->

      <ion-card>

        <ion-card-header>

          <ion-card-title>
            Firebase Connection
          </ion-card-title>

        </ion-card-header>


        <ion-card-content>

          <div class="firebase-status">

            <ion-badge
              v-if="firebaseStatus === 'checking'"
              color="warning"
            >
              Checking...
            </ion-badge>


            <ion-badge
              v-else-if="firebaseStatus === 'connected'"
              color="success"
            >
              Connected
            </ion-badge>


            <ion-badge
              v-else
              color="danger"
            >
              Not Connected
            </ion-badge>

          </div>


          <p>
            {{ firebaseMessage }}
          </p>


          <ion-button
            expand="block"
            fill="outline"
            @click="checkFirebaseConnection"
          >
            Check Firebase Connection
          </ion-button>

        </ion-card-content>

      </ion-card>



      <!-- STUDENT FORM -->

      <ion-card>

        <ion-card-header>

          <ion-card-title>

            {{
              editingId
                ? 'Edit Student'
                : 'Add Student'
            }}

          </ion-card-title>

        </ion-card-header>


        <ion-card-content>

          <form @submit.prevent="saveStudent">


            <ion-input
              v-model="form.name"
              label="Full Name"
              label-placement="stacked"
              fill="outline"
              placeholder="Enter student name"
              class="input-space"
            />


            <ion-input
              v-model="form.email"
              type="email"
              label="Email"
              label-placement="stacked"
              fill="outline"
              placeholder="Enter email"
              class="input-space"
            />


            <ion-input
              v-model="form.course"
              label="Course"
              label-placement="stacked"
              fill="outline"
              placeholder="Example: BSIT"
              class="input-space"
            />


            <ion-button
              expand="block"
              type="submit"
              :disabled="loading"
            >

              {{
                editingId
                  ? 'Update Student'
                  : 'Add Student'
              }}

            </ion-button>


            <ion-button
              v-if="editingId"
              expand="block"
              color="medium"
              type="button"
              @click="resetForm"
            >
              Cancel Edit
            </ion-button>

          </form>


          <p
            v-if="message"
            class="message"
          >
            {{ message }}
          </p>

        </ion-card-content>

      </ion-card>



      <!-- STUDENT RECORDS -->

      <ion-card>

        <ion-card-header>

          <ion-card-title>
            Student Records
          </ion-card-title>

        </ion-card-header>


        <ion-card-content>


          <p v-if="loading">
            Loading...
          </p>


          <p
            v-else-if="students.length === 0"
          >
            No student records found.
          </p>


          <ion-list v-else>


            <ion-item
              v-for="student in students"
              :key="student.id"
            >


              <ion-label>


                <h2>
                  {{ student.name }}
                </h2>


                <p>
                  {{ student.email }}
                </p>


                <p>
                  Course:
                  {{ student.course }}
                </p>


                <div class="actions">


                  <ion-button
                    size="small"
                    @click="startEdit(student)"
                  >
                    Edit
                  </ion-button>


                  <ion-button
                    size="small"
                    color="danger"
                    @click="
                      removeStudent(student.id)
                    "
                  >
                    Delete
                  </ion-button>


                </div>


              </ion-label>


            </ion-item>


          </ion-list>


        </ion-card-content>

      </ion-card>


    </ion-content>

  </ion-page>

</template>



<script setup lang="ts">

import {

  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,

  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,

  IonInput,
  IonButton,

  IonList,
  IonItem,
  IonLabel,

  IonBadge

} from '@ionic/vue';


import {

  ref,
  onMounted

} from 'vue';


import {
  ref as databaseRef,
  get,
  push,
  update,
  remove,
  serverTimestamp,
  query,
  limitToFirst
} from 'firebase/database';


import {

  db

} from '@/firebase';



/*
|--------------------------------------------------------------------------
| STUDENT TYPE
|--------------------------------------------------------------------------
*/

interface Student {

  id: string;

  name: string;

  email: string;

  course: string;

}



/*
|--------------------------------------------------------------------------
| VARIABLES
|--------------------------------------------------------------------------
*/

const students =
  ref<Student[]>([]);


const loading =
  ref(false);


const message =
  ref('');


const editingId =
  ref<string | null>(null);



const firebaseStatus =
  ref<
    'checking'
    | 'connected'
    | 'disconnected'
  >('checking');


const firebaseMessage =
  ref(
    'Checking Firebase connection...'
  );


const form = ref({

  name: '',

  email: '',

  course: ''

});



function describeFirebaseError(error: unknown): string {
  const detail = error instanceof Error ? error.message : String(error);
  if (/permission.?denied/i.test(detail)) {
    return 'Permission denied. Check Realtime Database rules for /students and Firebase Authentication; this app currently does not sign in users.';
  }
  return detail;
}

/*
|--------------------------------------------------------------------------
| CHECK FIREBASE CONNECTION
|--------------------------------------------------------------------------
*/

const checkFirebaseConnection =
  async () => {

    firebaseStatus.value =
      'checking';

    firebaseMessage.value =
      'Checking Firebase connection...';


    try {

      // Read at most one student. get() may use cached data when offline.

      const testQuery =
        query(
          databaseRef(
            db,
            'students'
          ),
          limitToFirst(1)
        );


      await get(
        testQuery
      );


      firebaseStatus.value =
        'connected';


      firebaseMessage.value =
        'Realtime Database read succeeded (may use cached data when offline).';

    }

    catch (error) {

      console.error(
        'Firebase connection error:',
        error
      );


      firebaseStatus.value =
        'disconnected';


      firebaseMessage.value = describeFirebaseError(error);

    }

};



/*
|--------------------------------------------------------------------------
| READ STUDENTS
|--------------------------------------------------------------------------
*/

const loadStudents =
  async () => {

    loading.value = true;


    try {

      const snapshot =
        await get(

          databaseRef(
            db,
            'students'
          )

        );


      const records: Student[] = [];
      snapshot.forEach((child) => {
        const data = child.val();
        records.push({
          id: child.key!,
          name: String(data?.name ?? ''),
          email: String(data?.email ?? ''),
          course: String(data?.course ?? '')
        });
      });
      students.value = records.sort((a, b) => a.name.localeCompare(b.name));


    }

    catch (error) {

      console.error(error);


      message.value =
        `Unable to load students: ${describeFirebaseError(error)}`;

    }

    finally {

      loading.value = false;

    }

};



/*
|--------------------------------------------------------------------------
| CREATE / UPDATE
|--------------------------------------------------------------------------
*/

const saveStudent =
  async () => {


    const name =
      form.value.name.trim();


    const email =
      form.value.email.trim();


    const course =
      form.value.course.trim();



    if (
      !name
      ||
      !email
      ||
      !course
    ) {

      message.value =
        'Please complete all fields.';

      return;

    }



    loading.value = true;


    try {


      /*
      |--------------------------------------------------------------------------
      | UPDATE
      |--------------------------------------------------------------------------
      */

      if (editingId.value) {


        await update(

          databaseRef(db, `students/${editingId.value}`),

          {

            name,

            email,

            course,

            updatedAt:
              serverTimestamp()

          }

        );


        message.value =
          'Student successfully updated.';

      }


      /*
      |--------------------------------------------------------------------------
      | CREATE
      |--------------------------------------------------------------------------
      */

      else {


        await push(

          databaseRef(
            db,
            'students'
          ),

          {

            name,

            email,

            course,

            createdAt:
              serverTimestamp()

          }

        );


        message.value =
          'Student successfully added.';

      }



      resetForm();


      await loadStudents();


      /*
       * Recheck Firebase after
       * successful CRUD operation.
       */

      await checkFirebaseConnection();


    }

    catch (error) {

      console.error(error);


      message.value =
        `Unable to save student: ${describeFirebaseError(error)}`;

    }

    finally {

      loading.value = false;

    }

};



/*
|--------------------------------------------------------------------------
| START EDIT
|--------------------------------------------------------------------------
*/

const startEdit =
  (student: Student) => {


    editingId.value =
      student.id;


    form.value = {

      name:
        student.name,

      email:
        student.email,

      course:
        student.course

    };

};



/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

const removeStudent =
  async (
    id: string
  ) => {


    const confirmed =
      window.confirm(
        'Are you sure you want to delete this student?'
      );


    if (!confirmed) {

      return;

    }


    loading.value = true;


    try {


      await remove(

        databaseRef(db, `students/${id}`)

      );


      if (
        editingId.value === id
      ) {

        resetForm();

      }


      message.value =
        'Student successfully deleted.';


      await loadStudents();


      await checkFirebaseConnection();


    }

    catch (error) {

      console.error(error);


      message.value =
        `Unable to delete student: ${describeFirebaseError(error)}`;

    }

    finally {

      loading.value = false;

    }

};



/*
|--------------------------------------------------------------------------
| RESET FORM
|--------------------------------------------------------------------------
*/

const resetForm =
  () => {


    editingId.value =
      null;


    form.value = {

      name: '',

      email: '',

      course: ''

    };

};



/*
|--------------------------------------------------------------------------
| PAGE START
|--------------------------------------------------------------------------
*/

onMounted(
  async () => {


    /*
     * First test Firebase.
     */

    await checkFirebaseConnection();


    /*
     * Then retrieve records.
     */

    await loadStudents();

  }
);

</script>



<style scoped>

.input-space {

  margin-bottom: 16px;

}


.message {

  text-align: center;

  margin-top: 15px;

  font-weight: 500;

}


.actions {

  margin-top: 10px;

}


.firebase-status {

  margin-bottom: 10px;

}


ion-card {

  max-width: 700px;

  margin-left: auto;

  margin-right: auto;

}

</style>