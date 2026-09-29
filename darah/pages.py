"""Halaman UI."""
from flask import Blueprint, render_template

pages_bp = Blueprint("pages", __name__)


@pages_bp.get("/")
def dashboard():
    return render_template("dashboard.html")


@pages_bp.get("/stok")
def stok():
    return render_template("stok.html")


@pages_bp.get("/permintaan")
def permintaan():
    return render_template("permintaan.html")


@pages_bp.get("/donor")
def donor():
    return render_template("donor.html")


@pages_bp.get("/kegiatan")
def kegiatan():
    return render_template("kegiatan.html")
