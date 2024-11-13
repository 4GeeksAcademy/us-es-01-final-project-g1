"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity
from api.models import db, Users, TrainingPlans, Exercises, SessionExercises, TrainingExercises, Sessions, MuscleExercises, Categories, Muscles 
import requests


api = Blueprint('api', __name__)
CORS(api)  # Allow CORS requests to this API


@api.route('/hello', methods=['GET'])
def handle_hello():
    response_body = {}
    response_body['message'] = "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    return response_body, 200

@api.route('/validate-token', methods=['GET'])
@jwt_required()
def validate_token():
    user_id = get_jwt_identity()
    return jsonify({"message": "Valid Token", "user_id": user_id}), 200
 

@api.route("/login", methods=["POST"])
def login():
    response_body = {}
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    user = db.session.execute(db.select(Users).where(Users.email == email, Users.password == password, Users.is_active)).scalar()
    if not user:
        response_body['message'] = "There is no account with this email, please register."
        return response_body, 404
    
    if user.password != password:
        response_body['message'] = "Incorrect password, please try again."
        return response_body, 401
    access_token = create_access_token(identity={"email": user.email, 'user_id': user.id, "is_admin": user.is_admin})
    response_body['message'] = f'Usuario {email} logeado con exito'
    response_body['access_token'] = access_token
    response_body['results'] = user.serialize()
    return response_body, 200


@api.route("/register", methods=["POST"])
def register():
    response_body = {}
    data = request.json
    email = request.json.get("email", None)
    row = db.session.execute(db.select(Users).where(Users.email == email)).scalar()
    if row: 
        response_body['message'] = "El email ya esta registrado"
        return jsonify(response_body), 404
    user = Users(email = data.get("email"),
                password = data.get("password"),
                is_active = True,
                is_admin = False,
                name = data.get("name"),
                age = data.get("age"),
                weight = data.get("weight"),
                height = data.get("height"),
                target_weight = data.get("target_weight"))   
    db.session.add(user)
    db.session.commit()
    access_token = create_access_token(identity={"email": user.email, 'user_id': user.id, "is_admin": user.is_admin})
    response_body['message'] = f'Usuario {email} Registrado con éxito'
    response_body['access_token'] = access_token
    response_body['results'] = user.serialize()
    return jsonify(response_body), 200


@api.route('/training-plans', methods=['GET', 'POST'])
@jwt_required()
def training_plans():
    response_body = {}
    current_user = get_jwt_identity()
    if request.method == 'GET':
        rows = db.session.execute(db.select(TrainingPlans).where(TrainingPlans.user_id == current_user['user_id'], TrainingPlans.is_active == True)).scalars()
        result = [row.serialize() for row in rows]    
        response_body['message'] = 'Listado de Planes de Entrenamiento'
        response_body['results'] = result
        return response_body, 200
    if request.method == 'POST':
        data = request.json
        exercise_data = data.get('exercises', []) 
        row = TrainingPlans(name=data.get('name'),
                            level=data.get('level'),
                            registration_date=data.get('registration_date'),
                            finalization_date=data.get('finalization_date'),
                            quantity_session=data.get('quantity_session'),
                            is_active=True,
                            user_id=current_user['user_id'])
        db.session.add(row)
        db.session.flush()

        for exercise in exercise_data:
            exercise_row =  TrainingExercises(
                training_plan_id=row.id,
                exercise_id=exercise['exercise_id'],
                repetitions=exercise['repetitions'],
                series=exercise['series']
            )
            db.session.add(exercise_row)

        db.session.commit()
        response_body['message'] = 'Plan de entrenamiento creado exitosamente'
        response_body['results'] = row.serialize()
        return response_body, 200


@api.route('/training-plans/<int:id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def training_plan(id):
    response_body = {}
    current_user = get_jwt_identity()
    row = db.session.execute(db.select(TrainingPlans).where(TrainingPlans.id == id)).scalar()
    if not row:
        response_body['message'] = f'El plan de entrenamiento {id} no existe'
        response_body['results'] = {}
        return response_body, 404
    if row.user_id != current_user['user_id']:
        response_body['message'] = f'Usted no puede modificar, ver o borrar los datos del plan {id}'
        response_body['results'] = {}
        return response_body, 403
    if request.method == 'GET':
        response_body['message'] = f'Detalle del plan de entrenamiento {id}'
        response_body['results'] = row.serialize()
        return response_body, 200
    if request.method == 'PUT':
        data = request.json
        row.name = data.get('name')
        row.level = data.get('level')
        row.registration_date = data.get('registration_date')
        row.finalization_date = data.get('finalization_date')
        row.quantity_session = data.get('quantity_session')
        row.is_active = data.get('is_active')

         # Actualizar los ejercicios asociados
        updated_exercises = data.get('exercises', [])

        # Recoger los IDs de ejercicios existentes asociados a este plan
        current_exercise_ids = {exercise.exercise_id for exercise in row.training_exercises}

         # Recoger los IDs de ejercicios actualizados
        updated_exercise_ids = {exercise['exercise_id'] for exercise in updated_exercises}

        # Eliminar ejercicios que no están en la nueva lista
        exercises_to_delete = current_exercise_ids - updated_exercise_ids
        TrainingExercises.query.filter(
            TrainingExercises.training_plan_id == id,
            TrainingExercises.exercise_id.in_(exercises_to_delete)
        ).delete(synchronize_session='fetch')

          # Insertar o actualizar los ejercicios
        for exercise_data in updated_exercises:
            exercise = TrainingExercises.query.filter_by(
                training_plan_id=id,
                exercise_id=exercise_data['exercise_id']
            ).first()
            if exercise:
                # Actualizar los ejercicios existentes
                exercise.repetitions = exercise_data['repetitions']
                exercise.series = exercise_data['series']
            else:
                # Insertar los nuevos ejercicios
                new_exercise = TrainingExercises(
                    training_plan_id=id,
                    exercise_id=exercise_data['exercise_id'],
                    repetitions=exercise_data['repetitions'],
                    series=exercise_data['series']
                )
                db.session.add(new_exercise)

        db.session.commit()
        response_body['message'] = f'Plan de entrenamiento {id} actualizado correctamente'
        response_body['results'] = row.serialize()
        return response_body, 200
    if request.method == 'DELETE':
        row.is_active = False
        db.session.commit()
        response_body['message'] = f'Plan de entrenamiento {id} eliminado correctamente'
        response_body['results'] = {}
        return response_body, 200


@api.route('/sessions', methods=['GET', 'POST'])
@jwt_required()
def sessions():
    response_body = {}
    current_user = get_jwt_identity()
    if request.method == 'GET':
        rows = db.session.execute(db.select(Sessions).join(TrainingPlans).where(TrainingPlans.user_id == current_user['user_id'])).scalars()

        result = [row.serialize() for row in rows]    
        response_body['message'] = 'Listado de Sesiones'
        response_body['results'] = result
        return response_body, 200
    if request.method == 'POST':
        data = request.json
        plan_id = data.get('training_plan_id', None)
        if not plan_id: 
            response_body['message'] = 'Faltan datos en el request (training_plan_id)'
            return response_body, 400
        
        training_plan = db.session.execute(db.select(TrainingPlans).where(TrainingPlans.id == plan_id)).scalars().first()
        if not training_plan:
            response_body['message'] = 'El Plan no existe'
            return response_body, 400
        if training_plan.user_id != current_user['user_id']:
            response_body['message'] = 'Sin Autorizacion'
            return response_body, 401
        
        new_session = Sessions(
            date=data.get('date'),
            training_plan_id=plan_id,
            name=data.get('name')
        )

        db.session.add(new_session)
        db.session.flush()  # Obtener el ID de la nueva sesin antes del commit

        # Obtener los exercises del TrainingPlan y crear los ejercicios de sesion
        training_exercises = db.session.query(TrainingExercises).filter_by(training_plan_id=plan_id).all()
        for exercise in training_exercises:
            session_exercise = SessionExercises(
                session_id=new_session.id,
                exercise_id=exercise.exercise_id,
                repetitions=0,
                series=0,
                is_done=False  # inicializamos como no completado
            )
            db.session.add(session_exercise)

        db.session.commit()
        response_body['message'] = 'Sesión creada exitosamente con ejercicios del plan'
        response_body['results'] = new_session.serialize()
        return response_body, 200


@api.route('/exercises', methods=['GET', 'POST'])
@jwt_required()
def exercises():
    response_body = {}
    if request.method == 'GET':
        rows = db.session.execute(db.select(Exercises)).scalars()
        result = [row.serialize() for row in rows]
        response_body['message'] = 'Listado de Ejercicios'
        response_body['results'] = result
        return response_body, 200
    if request.method == 'POST':
        data = request.json
        row = Exercises(name=data.get('name'),
                        description=data.get('description'),
                        muscle=data.get('muscle'),
                        exercise_base=data.get('exercise_base'),
                        category_id=data.get('category_id'))
        db.session.add(row)
        db.session.commit()
        response_body['message'] = 'Ejercicio creado exitosamente'
        response_body['results'] = row.serialize()
        return response_body, 200


@api.route('/session-exercises', methods=['GET', 'POST'])
@jwt_required()
def session_exercises():
    response_body = {}
    if request.method == 'GET':
        rows = db.session.execute(db.select(SessionExercises)).scalars()
        result = [row.serialize() for row in rows]
        response_body['message'] = 'Listado de Ejercicios por Sesión'
        response_body['results'] = result
        return response_body, 200
    if request.method == 'POST':
        data = request.json
        row = SessionExercises(session_id=data.get('session_id'),
                               exercise_id=data.get('exercise_id'),
                               repetitions=data.get('repetitions'),
                               series=data.get('series'),
                               is_done=data.get('is_done'))
        db.session.add(row)
        db.session.commit()
        response_body['message'] = 'Ejercicio añadido a la sesión exitosamente'
        response_body['results'] = row.serialize()
        return response_body, 200


@api.route('/training-exercises', methods=['GET', 'POST'])
@jwt_required()
def training_exercises():
    response_body = {}
    if request.method == 'GET':
        rows = db.session.execute(db.select(TrainingExercises)).scalars()
        result = [row.serialize() for row in rows]
        response_body['message'] = 'Listado de Ejercicios por Plan de Entrenamiento'
        response_body['results'] = result
        return response_body, 200
    if request.method == 'POST':
        data = request.json

        # Verifica si `data` es un solo objeto o una lista de objetos
        exercises_data = data if isinstance(data, list) else [data]
        new_exercises = []
        for exercise in exercises_data:
            row = TrainingExercises(
                training_plan_id=exercise.get('training_plan_id'),
                exercise_id=exercise.get('exercise_id'),
                repetitions=exercise.get('repetitions'),
                series=exercise.get('series')
            )
            db.session.add(row)
            new_exercises.append(row)

        db.session.commit()
        response_body['message'] = 'Ejercicio añadido al plan de entrenamiento exitosamente'
        response_body['results'] = row.serialize()
        return response_body, 200



@api.route('/muscles', methods=['GET'])
@jwt_required()
def muscles():
    response_body = {}

    rows = db.session.execute(db.select(Muscles)).scalars()

    result = [row.serialize() for row in rows]

    response_body['message'] = 'Listado de musculos'
    response_body['results'] = result

    return jsonify(response_body), 200


@api.route('/session-exercises', methods=['PUT'])
@jwt_required()
def update_session_exercise():
    data = request.json.get("exercises", [])
    
    if not data:
        return {"message": "No se proporcionaron ejercicios para actualizar"}, 400

    response_body = {"updated": [], "failed": []}

    for exercise_data in data:
        exercise_id = exercise_data.get("id")
        session_exercise = db.session.get(SessionExercises, exercise_id)

        if not session_exercise:
            response_body["failed"].append({"id": exercise_id, "message": "El ejercicio no existe"})
            continue

        # Actualizamos los datos del ejercicio
        session_exercise.series = exercise_data.get("completedSeries", session_exercise.series)
        session_exercise.repetitions = exercise_data.get("completedRepetitions", session_exercise.repetitions)
        session_exercise.is_done = exercise_data.get("is_done", session_exercise.is_done)

        response_body["updated"].append(session_exercise.serialize())

    db.session.commit()
    return {"message": "Progreso actualizado correctamente", "results": response_body}, 200


# Obtener todas las imgs en lotes
def fetch_all_images():
    image_dict = {}
    limit = 100
    offset = 0
    total_images = 317  # total de imgs esperadas
    while offset < total_images:
        response = requests.get(f'https://wger.de/api/v2/exerciseimage/?limit={limit}&offset={offset}')
        if response.status_code == 200:
            images_data = response.json()
            # Actualizar image_dict con las nuevas imgs
            image_dict.update({img["exercise_base"]: img["image"] for img in images_data["results"]})
            offset += limit
        else:
            print("Error al obtener imgs:", response.status_code)
            break
    return image_dict


# la idea es que mandemos esta una unica vez para poder popular los datos basicos.
@api.route('/initial-setup', methods=['GET'])
@jwt_required()
def initial_setup():
    response_body = {}
    current_user = get_jwt_identity()
    if not current_user["is_admin"]: 
        return {"message": "Unauthorized"}, 401

    # Llamar a fetch_all_images para obtener todas las imgs de ejercicios o las que se puedan
    image_dict = fetch_all_images()

    # Procesar y almacenar musculos
    url = 'https://wger.de/api/v2/muscle/'
    response = requests.get(url)
    if response.status_code == 200:
        muscles_data = response.json()
        for row in muscles_data["results"]:
            muscle = Muscles(
                id=row['id'],
                name=row['name'],
                name_en=row['name_en'],
                is_front=row['is_front'],
                image_url_main=row['image_url_main'],
                image_url_secondary=row['image_url_secondary']
            )
            db.session.add(muscle)
        db.session.commit()
    
    # Procesar y almacenar categorias
    url = 'https://wger.de/api/v2/exercisecategory/'
    response = requests.get(url)
    if response.status_code == 200:
        categories_data = response.json()
        for row in categories_data["results"]:
            category = Categories(id=row['id'], name=row['name'])
            db.session.add(category)
        db.session.commit()

    # Obtener y almacenar ejercicios en varios lotes con language=4 (español)
    limit = 100
    offset = 0
    response_body["exercises"] = []
    while True:
        url = f'https://wger.de/api/v2/exercise/?limit={limit}&offset={offset}&language=4&equipment=7'
        response = requests.get(url)
        if response.status_code != 200:
            break

        exercises_data = response.json()["results"]
        for row in exercises_data:
            # Verificar si el ejercicio tiene un msculo asociado y si ese musculo estae en la base de datos
            muscle_id = row['muscles'][0] if row['muscles'] else None
            if muscle_id:
                muscle = db.session.query(Muscles).filter_by(id=muscle_id).first()
                if not muscle:
                    print(f"Omitiendo ejercicio {row['name']} - músculo {muscle_id} no encontrado.")
                    continue  # Si el musculo no existe, omitir este ejercicio
            else:
                print(f"Omitiendo ejercicio {row['name']} - sin músculo especificado.")
                continue  # Si no hay ningún musculo especificado, omitir el ejercicio

            # Verificar si el ejercicio ya existe en la base de datos
            existing_exercise = db.session.query(Exercises).filter_by(id=row['id']).first()
            if existing_exercise:
                continue  # Omitir si el ejercicio ya está en la base de datos

            # Obtener la URL de la imagen si está disponible
            exercise_image_url = image_dict.get(row['exercise_base'], None)

            # Crear y almacenar el ejercicio
            exercise = Exercises(
                id=row['id'],
                name=row['name'],
                description=row['description'],
                muscle_id=muscle_id,
                exercise_base=row['exercise_base'],
                category_id=row['category'],
                image_url=exercise_image_url
            )
            db.session.add(exercise)
            response_body["exercises"].append({"id": row['id'], "name": row['name'], "image_url": exercise_image_url})  # Agregar a la respuesta

        db.session.commit()
        offset += limit
        if not exercises_data:
            break  # Termina cuando no hay más ejercicios disponibles

    response_body["message"] = "Setup completo"
    return response_body, 200

