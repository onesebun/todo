from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Todo(models.Model):
    id = models.AutoField(primary_key=True)
    author = models.ForeignKey(User, db_column="user", on_delete=models.CASCADE)
    task = models.CharField(max_length=200)
    done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)