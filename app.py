
from flask import Flask, render_template, request
from flask_sqlalchemy import SQLAlchemy
import pymysql

pymysql.install_as_MySQLdb()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:123456@localhost/db_name'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class UserPoint(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50))
    student_id = db.Column(db.String(20))
    score = db.Column(db.Integer)

    def __init__(self, username, student_id, score):
        self.username = username
        self.student_id = student_id
        self.score = score

@app.route('/userpoint', methods=['POST'])
def save_user_point():
    username = request.form.get('username')
    student_id = request.form.get('studentID')
    score = request.form.get('score')

    record = UserPoint.query.filter_by(student_id=student_id).first()
    user_point = UserPoint(username, student_id, score)
    if not record:
            # 学生ID对应的记录不存在，创建新的记录
        new_record = UserPoint(student_id=student_id, username=username, score=score)
        db.session.add(new_record)
    else:
        # 学生ID对应的记录已存在，根据需求更新用户名和分数
        if record.username != username:
            record.username = username
        if record.score < score:
            record.score = score
        if record.score >= score:
            record.score = score
            
    db.session.commit()

    return 'Record updated successfully.'

if __name__ == '__main__':
    app.run()