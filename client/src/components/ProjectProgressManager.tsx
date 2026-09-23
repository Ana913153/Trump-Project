import { ChangeEvent, useEffect, useState } from "react";
import { ImagePlus, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type ProjectProgress = {
  title: string;
  description: string;
  imageUrl?: string | null;
  targetAmountCents: number;
  raisedAmountCents: number;
  currencyCode: string;
  eyebrow: string;
  sectionTitle: string;
  milestonesLabel: string;
  milestonesTitle: string;
  peopleLabel: string;
  peopleTitle: string;
};

type Milestone = {
  id: number;
  title: string;
  description: string;
};

type Person = {
  id: number;
  name: string;
  role: string;
  bio: string;
  imageUrl?: string | null;
};

const blankProject: ProjectProgress = {
  title: "Community project progress",
  description: "",
  imageUrl: "",
  targetAmountCents: 0,
  raisedAmountCents: 0,
  currencyCode: "USD",
  eyebrow: "Project Transparency",
  sectionTitle: "Community Project Progress",
  milestonesLabel: "Stage Outcomes",
  milestonesTitle: "Milestones",
  peopleLabel: "People",
  peopleTitle: "Project Team",
};

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

function mediaUrl(value?: string | null) {
  if (!value) return "";
  if (value.startsWith("/manus-storage/") || value.startsWith("/api/storage/") || /^https?:\/\//.test(value)) return value;
  return `/manus-storage/${value.replace(/^\/+/, "")}`;
}

type ImageMimeType = (typeof imageTypes)[number];

export default function ProjectProgressManager() {
  const projectQuery = trpc.admin.getProjectContent.useQuery(undefined, {
    retry: false,
  });

  const [project, setProject] = useState<ProjectProgress>(blankProject);

  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDescription, setMilestoneDescription] = useState("");
  const [editingMilestoneId, setEditingMilestoneId] = useState<number | null>(null);

  const [personName, setPersonName] = useState("");
  const [personRole, setPersonRole] = useState("");
  const [personBio, setPersonBio] = useState("");
  const [personImageUrl, setPersonImageUrl] = useState("");
  const [editingPersonId, setEditingPersonId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  useEffect(() => {
    if (projectQuery.data?.projectProgress) {
      setProject(projectQuery.data.projectProgress);
    }
  }, [projectQuery.data?.projectProgress]);

  const refresh = async () => {
    await projectQuery.refetch();
    await utils.content.public.invalidate();
  };

  const uploadContentImageMutation =
    trpc.admin.uploadContentImage.useMutation();

  const updateProject = trpc.admin.updateProjectProgress.useMutation({
    onSuccess: async () => {
      await refresh();
      toast.success("Project progress saved and published");
    },
    onError: (error) => toast.error(error.message),
  });

  const createMilestone = trpc.admin.createProjectMilestone.useMutation({
    onSuccess: async () => {
      setMilestoneTitle("");
      setMilestoneDescription("");
      await refresh();
      toast.success("阶段成果已添加");
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMilestone = trpc.admin.updateProjectMilestone.useMutation({
    onSuccess: async () => {
      cancelMilestoneEdit();
      await refresh();
      toast.success("阶段成果已修改");
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMilestone = trpc.admin.deleteProjectMilestone.useMutation({
    onSuccess: async () => {
      await refresh();
      toast.success("阶段成果已删除");
    },
    onError: (error) => toast.error(error.message),
  });

  const createPerson = trpc.admin.createProjectPerson.useMutation({
    onSuccess: async () => {
      clearPersonForm();
      await refresh();
      toast.success("People已添加");
    },
    onError: (error) => toast.error(error.message),
  });

  const updatePerson = trpc.admin.updateProjectPerson.useMutation({
    onSuccess: async () => {
      clearPersonForm();
      await refresh();
      toast.success("People资料已修改");
    },
    onError: (error) => toast.error(error.message),
  });

  const deletePerson = trpc.admin.deleteProjectPerson.useMutation({
    onSuccess: async () => {
      await refresh();
      toast.success("People已删除");
    },
    onError: (error) => toast.error(error.message),
  });

  const milestones = (projectQuery.data?.milestones || []) as Milestone[];
  const people = (projectQuery.data?.people || []) as Person[];

  const uploadImage = (
    event: ChangeEvent<HTMLInputElement>,
    onUploaded: (url: string) => void,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!imageTypes.includes(file.type as ImageMimeType)) {
      toast.error("只支持 JPG、PNG、WEBP 或 GIF 图片");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("图片不能超过 10MB");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || "");

      uploadContentImageMutation.mutate(
        {
          fileName: file.name,
          mimeType: file.type as ImageMimeType,
          base64: result,
        },
        {
          onSuccess: (uploaded) => {
            onUploaded(uploaded.url);
            toast.success("图片上传成功");
          },
          onError: (error) => {
            toast.error(`图片上传失败：${error.message}`);
          },
        },
      );
    };

    reader.onerror = () => {
      toast.error("读取图片失败");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const submitProject = () => {
    if (!project.title.trim() || !project.description.trim()) {
      toast.error("Please enter the project title and description");
      return;
    }

    if (
      !Number.isFinite(project.targetAmountCents) ||
      !Number.isFinite(project.raisedAmountCents) ||
      project.targetAmountCents < 0 ||
      project.raisedAmountCents < 0
    ) {
      toast.error("金额不能小于 0");
      return;
    }

    updateProject.mutate({
      ...project,
      title: project.title.trim(),
      description: project.description.trim(),
      imageUrl: project.imageUrl || "",
      currencyCode: project.currencyCode.trim().toUpperCase() || "USD",
    });
  };

  const startMilestoneEdit = (milestone: Milestone) => {
    setEditingMilestoneId(milestone.id);
    setMilestoneTitle(milestone.title);
    setMilestoneDescription(milestone.description);
  };

  const cancelMilestoneEdit = () => {
    setEditingMilestoneId(null);
    setMilestoneTitle("");
    setMilestoneDescription("");
  };

  const saveMilestone = () => {
    if (!milestoneTitle.trim() || !milestoneDescription.trim()) {
      toast.error("请填写阶段标题和Bio");
      return;
    }

    if (editingMilestoneId !== null) {
      updateMilestone.mutate({
        id: editingMilestoneId,
        title: milestoneTitle.trim(),
        description: milestoneDescription.trim(),
      });
      return;
    }

    createMilestone.mutate({
      title: milestoneTitle.trim(),
      description: milestoneDescription.trim(),
    });
  };

  const startPersonEdit = (person: Person) => {
    setEditingPersonId(person.id);
    setPersonName(person.name);
    setPersonRole(person.role);
    setPersonBio(person.bio);
    setPersonImageUrl(person.imageUrl || "");
  };

  const clearPersonForm = () => {
    setEditingPersonId(null);
    setPersonName("");
    setPersonRole("");
    setPersonBio("");
    setPersonImageUrl("");
  };

  const savePerson = () => {
    if (!personName.trim() || !personRole.trim() || !personBio.trim()) {
      toast.error("请填写People姓名、Role和Bio");
      return;
    }

    const data = {
      name: personName.trim(),
      role: personRole.trim(),
      bio: personBio.trim(),
      imageUrl: personImageUrl || "",
    };

    if (editingPersonId !== null) {
      updatePerson.mutate({
        id: editingPersonId,
        ...data,
      });
      return;
    }

    createPerson.mutate(data);
  };

  const projectImageUploading = uploadContentImageMutation.isPending;

  return (
    <section className="project-content-manager">
      <div className="content-management-heading">
        <span className="auth-eyebrow">PUBLIC DONATION CONTENT</span>
        <h2>项目进度与People</h2>
        <p>这里保存的内容会同步到公开捐款页面。</p>
      </div>

      <div className="project-manager-grid">
        <div className="content-card project-basics-card">
          <div className="content-card-title">
            <div>
              <h3>Project basics</h3>
              <span>标题、简介、筹款目标、已筹金额与币种。</span>
            </div>
          </div>

          <div className="project-form-fields">
            <label className="field-label">
              透明度眉题
              <input value={project.eyebrow} onChange={(event) => setProject({ ...project, eyebrow: event.target.value })} />
            </label>
            <label className="field-label">
              进展主标题
              <input value={project.sectionTitle} onChange={(event) => setProject({ ...project, sectionTitle: event.target.value })} />
            </label>
            <label className="field-label">
              Stage Outcomes标签
              <input value={project.milestonesLabel} onChange={(event) => setProject({ ...project, milestonesLabel: event.target.value })} />
            </label>
            <label className="field-label">
              Milestones标题
              <input value={project.milestonesTitle} onChange={(event) => setProject({ ...project, milestonesTitle: event.target.value })} />
            </label>
            <label className="field-label">
              People标签
              <input value={project.peopleLabel} onChange={(event) => setProject({ ...project, peopleLabel: event.target.value })} />
            </label>
            <label className="field-label">
              People团队标题
              <input value={project.peopleTitle} onChange={(event) => setProject({ ...project, peopleTitle: event.target.value })} />
            </label>
            <label className="field-label">
              Project title
              <input
                value={project.title}
                onChange={(event) =>
                  setProject({
                    ...project,
                    title: event.target.value,
                  })
                }
              />
            </label>

            <label className="field-label">
              Project image
              <div className="project-image-upload">
                {project.imageUrl ? (
                  <div className="project-image-preview">
                    <img src={mediaUrl(project.imageUrl)} alt="Project image预览" />
                    <button
                      type="button"
                      className="faq-edit-button danger"
                      onClick={() =>
                        setProject({
                          ...project,
                          imageUrl: "",
                        })
                      }
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : null}

                <label className="admin-upload-button">
                  <ImagePlus size={16} />
                  {projectImageUploading ? "Uploading…" : "选择Project image"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    hidden
                    disabled={projectImageUploading}
                    onChange={(event) =>
                      uploadImage(event, (url) =>
                        setProject({
                          ...project,
                          imageUrl: url,
                        }),
                      )
                    }
                  />
                </label>
              </div>
            </label>

            <label className="field-label project-form-wide">
              Project description
              <textarea
                value={project.description}
                onChange={(event) =>
                  setProject({
                    ...project,
                    description: event.target.value,
                  })
                }
                rows={4}
              />
            </label>

            <label className="field-label">
              目标金额
              <input
                type="number"
                min="0"
                step="0.01"
                value={(project.targetAmountCents / 100).toString()}
                onChange={(event) =>
                  setProject({
                    ...project,
                    targetAmountCents: Math.round(
                      Number(event.target.value || 0) * 100,
                    ),
                  })
                }
              />
            </label>

            <label className="field-label">
              已筹集金额
              <input
                type="number"
                min="0"
                step="0.01"
                value={(project.raisedAmountCents / 100).toString()}
                onChange={(event) =>
                  setProject({
                    ...project,
                    raisedAmountCents: Math.round(
                      Number(event.target.value || 0) * 100,
                    ),
                  })
                }
              />
            </label>

            <label className="field-label">
              币种
              <input
                value={project.currencyCode}
                onChange={(event) =>
                  setProject({
                    ...project,
                    currencyCode: event.target.value.toUpperCase(),
                  })
                }
                maxLength={12}
                placeholder="USD"
              />
            </label>
          </div>

          <button
            className="admin-primary"
            disabled={updateProject.isPending || projectImageUploading}
            onClick={submitProject}
          >
            <Save size={15} />
            {updateProject.isPending ? "Saving…" : "保存Project basics"}
          </button>
        </div>

        <div className="content-card">
          <div className="content-card-title">
            <div>
              <h3>阶段成果</h3>
              <span>可以新增、修改或删除公开显示的Milestones。</span>
            </div>
          </div>

          <div className="project-admin-list">
            {milestones.length ? (
              milestones.map((milestone) => (
                <div className="project-admin-row" key={milestone.id}>
                  <div>
                    <b>{milestone.title}</b>
                    <span>{milestone.description}</span>
                  </div>

                  <div className="project-admin-actions">
                    <button
                      type="button"
                      className="faq-edit-button"
                      onClick={() => startMilestoneEdit(milestone)}
                      aria-label={`编辑 ${milestone.title}`}
                    >
                      <Save size={14} />
                    </button>

                    <button
                      type="button"
                      className="faq-edit-button danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            `确定删除阶段成果「${milestone.title}」吗？`,
                          )
                        ) {
                          deleteMilestone.mutate({
                            id: milestone.id,
                          });
                        }
                      }}
                      aria-label={`删除 ${milestone.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <span className="content-muted">暂未添加阶段成果。</span>
            )}
          </div>

          <div className="content-add-form">
            <input
              value={milestoneTitle}
              onChange={(event) => setMilestoneTitle(event.target.value)}
              placeholder={
                editingMilestoneId !== null ? "修改阶段标题" : "阶段标题"
              }
            />

            <textarea
              value={milestoneDescription}
              onChange={(event) =>
                setMilestoneDescription(event.target.value)
              }
              placeholder="阶段成果Bio"
              rows={3}
            />

            <div className="project-form-actions">
              <button
                className="admin-primary"
                disabled={
                  createMilestone.isPending || updateMilestone.isPending
                }
                onClick={saveMilestone}
              >
                {editingMilestoneId !== null ? (
                  <>
                    <Save size={15} />
                    保存修改
                  </>
                ) : (
                  <>
                    <Plus size={15} />
                    添加阶段成果
                  </>
                )}
              </button>

              {editingMilestoneId !== null && (
                <button
                  type="button"
                  className="admin-secondary"
                  onClick={cancelMilestoneEdit}
                >
                  取消
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="content-card project-people-card">
          <div className="content-card-title">
            <div>
              <h3>项目People</h3>
              <span>可以新增、修改、删除People，并直接上传People照片。</span>
            </div>
          </div>

          <div className="project-admin-list">
            {people.length ? (
              people.map((person) => (
                <div
                  className="project-admin-row project-person-admin-row"
                  key={person.id}
                >
                  {person.imageUrl ? (
                    <img src={mediaUrl(person.imageUrl)} alt={person.name} />
                  ) : (
                    <span>
                      {person.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}

                  <div>
                    <b>
                      {person.name} · {person.role}
                    </b>
                    <span>{person.bio}</span>
                  </div>

                  <div className="project-admin-actions">
                    <button
                      type="button"
                      className="faq-edit-button"
                      onClick={() => startPersonEdit(person)}
                      aria-label={`编辑 ${person.name}`}
                    >
                      <Save size={14} />
                    </button>

                    <button
                      type="button"
                      className="faq-edit-button danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            `确定删除People「${person.name}」吗？`,
                          )
                        ) {
                          deletePerson.mutate({
                            id: person.id,
                          });
                        }
                      }}
                      aria-label={`删除 ${person.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <span className="content-muted">暂未添加People。</span>
            )}
          </div>

          <div className="content-add-form">
            <input
              value={personName}
              onChange={(event) => setPersonName(event.target.value)}
              placeholder="People姓名"
            />

            <input
              value={personRole}
              onChange={(event) => setPersonRole(event.target.value)}
              placeholder="Role / 职务"
            />

            <textarea
              value={personBio}
              onChange={(event) => setPersonBio(event.target.value)}
              placeholder="PeopleBio"
              rows={3}
            />

            <div className="person-image-upload">
              {personImageUrl ? (
                <div className="person-image-preview">
                  <img src={mediaUrl(personImageUrl)} alt="People照片预览" />
                  <button
                    type="button"
                    className="faq-edit-button danger"
                    onClick={() => setPersonImageUrl("")}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : null}

              <label className="admin-upload-button">
                <ImagePlus size={16} />
                {uploadContentImageMutation.isPending
                  ? "图片Uploading…"
                  : "上传People照片"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  hidden
                  disabled={uploadContentImageMutation.isPending}
                  onChange={(event) =>
                    uploadImage(event, setPersonImageUrl)
                  }
                />
              </label>
            </div>

            <div className="project-form-actions">
              <button
                className="admin-primary"
                disabled={
                  createPerson.isPending ||
                  updatePerson.isPending ||
                  uploadContentImageMutation.isPending
                }
                onClick={savePerson}
              >
                {editingPersonId !== null ? (
                  <>
                    <Save size={15} />
                    保存People修改
                  </>
                ) : (
                  <>
                    <Plus size={15} />
                    添加People
                  </>
                )}
              </button>

              {editingPersonId !== null && (
                <button
                  type="button"
                  className="admin-secondary"
                  onClick={clearPersonForm}
                >
                  取消
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
