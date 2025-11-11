//CRUD Project

import express, { Request, Response } from "express";
import * as schema from "../db/schema";
import { db } from "../db";
import { authMiddleware, RequestWithUser } from "../middleware";
import { and, asc, desc, eq, inArray, count, like } from "drizzle-orm";
import { scrapeWebsite } from "../utils/scrape-website";
import { sanitizeUrl } from "../utils/sanitize-url";
const router = express.Router();

router.post("/create", authMiddleware, async (req: Request, res: Response) => {
  const user = (req as RequestWithUser).user;

  if (!req.body) {
    res.status(400).json({ error: "No body" });
    return;
  }

  const projectName = req.body?.projectName;
  const companyUrl = sanitizeUrl(req.body?.companyUrl);
  if (!projectName) {
    res.status(400).json({ error: "Project name is required" });
    return;
  }

  const project = await db
    .insert(schema.projects)
    .values({
      projectName: projectName,
    })
    .returning({
      id: schema.projects.id,
    });

  const userToProject = await db.insert(schema.userToProject).values({
    userId: user.id,
    projectId: project[0].id,
  });

  //Find company by url
  let company: any = await db.query.companiesTable.findFirst({
    where: eq(schema.companiesTable.companyUrl, companyUrl),
  });

  if (!company) {
    //Create it
    company = await scrapeWebsite(companyUrl);
  }

  res.json({ success: true, project: project, company: company });
});

router.post(
  "/find-companies",
  authMiddleware,
  async (req: Request, res: Response) => {
    const user = (req as RequestWithUser).user;
    const companyUrl = sanitizeUrl(req.body.companyUrl);

    //Find company by url
    const companies = await db.query.companiesTable.findMany({
      where: like(schema.companiesTable.companyUrl, "%" + companyUrl + "%"),
    });

    let scrapedCompany: any = null;
    if (companies.length === 0) {
      scrapedCompany = await scrapeWebsite(companyUrl);
    }

    console.log("companies", companies);
    res.json({ companies, scrapedCompany });
  }
);

router.post(
  "/create-company",
  authMiddleware,
  async (req: Request, res: Response) => {
    const user = (req as RequestWithUser).user;
    const companyUrl = sanitizeUrl(req.body.companyUrl);
    const companyName = req.body.companyName;
    const companyDescription = req.body.companyDescription;
    const companyImageUrl = req.body.companyImageUrl;
    const projectId = req.body.projectId;

    const newCompany = await db
      .insert(schema.companiesTable)
      .values({
        companyName: companyName,
        companyDescription: companyDescription,
        companyImageUrl: companyImageUrl,
        companyUrl: companyUrl,
      })
      .returning({
        id: schema.companiesTable.id,
        companyName: schema.companiesTable.companyName,
        companyDescription: schema.companiesTable.companyDescription,
        companyImageUrl: schema.companiesTable.companyImageUrl,
        companyUrl: schema.companiesTable.companyUrl,
      });

    if (!newCompany) {
      res.status(500).json({ error: "Failed to create company" });
      return;
    }

    //Check if existts then delete
    const projectToCompany = await db.query.projectToCompanyTable.findFirst({
      where: eq(schema.projectToCompanyTable.projectId, projectId),
    });
    if (projectToCompany) {
      await db
        .delete(schema.projectToCompanyTable)
        .where(eq(schema.projectToCompanyTable.id, projectToCompany.id));
    }

    const projectToCompanyAdd = await db
      .insert(schema.projectToCompanyTable)
      .values({
        projectId: projectId,
        companyId: newCompany[0].id,
      });

    res.json({ company: newCompany[0] || [] });
  }
);

router.post(
  "/scrape-company",
  authMiddleware,
  async (req: Request, res: Response) => {
    const user = (req as RequestWithUser).user;
    const companyUrl = sanitizeUrl(req.body.companyUrl);
    const scrapedCompany = await scrapeWebsite(companyUrl);
    res.json({ scrapedCompany });
  }
);

router.post(
  "/select-company-to-project",
  authMiddleware,
  async (req: Request, res: Response) => {
    const user = (req as RequestWithUser).user;
    const companyId = req.body.companyId;
    const projectId = req.body.projectId;

    //Check if projectId is valid and belongs to user
    try {
      const project = await db.query.userToProject.findFirst({
        where: and(
          eq(schema.userToProject.projectId, projectId),
          eq(schema.userToProject.userId, user?.id)
        ),
      });
      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error: "Failed to select company to project" });
      return;
    }

    //Check if existts then delete
    const projectToCompany = await db.query.projectToCompanyTable.findFirst({
      where: eq(schema.projectToCompanyTable.projectId, projectId),
    });
    if (projectToCompany) {
      await db
        .delete(schema.projectToCompanyTable)
        .where(eq(schema.projectToCompanyTable.id, projectToCompany.id));
    }

    const projectToCompanyAdd = await db
      .insert(schema.projectToCompanyTable)
      .values({
        projectId: projectId,
        companyId: companyId,
      })
      .returning({
        id: schema.projectToCompanyTable.id,
        companyId: schema.projectToCompanyTable.companyId,
        projectId: schema.projectToCompanyTable.projectId,
      });
    res.json({ projectToCompanyAdd: projectToCompanyAdd[0] });
  }
);

// router.post(
//   "/find-companies",
//   authMiddleware,
//   async (req: Request, res: Response) => {
//     const user = (req as RequestWithUser).user;
//     const companyUrl = req.body.companyUrl;

//     //Find company by url
//     const company = await db.query.companiesTable.findFirst({
//       where: eq(schema.companiesTable.companyUrl, companyUrl),
//     });

//     let companyId = company?.id || null;
//     if (!company) {
//       //Create it
//       const scrapedCompany = await scrapeWebsite(companyUrl);
//       if (!scrapedCompany.companyName) {
//         res.status(400).json({ error: "Company name not found" });
//         return;
//       }

//       //Create company
//       const newCompany = await db
//         .insert(schema.companiesTable)
//         .values({
//           companyName: scrapedCompany.companyName,
//           companyUrl: companyUrl,
//           companyDescription: scrapedCompany.companyDescription,
//           companyImageUrl: scrapedCompany.companyImageUrl,
//         })
//         .returning({
//           id: schema.companiesTable.id,
//         });

//       companyId = newCompany[0].id;
//     }

//     if (!companyId) {
//       res.status(400).json({ error: "Company not found or created" });
//       return;
//     }

//     //Get cpompany details
//     const companyDetails = await db.query.companiesTable.findFirst({
//       where: eq(schema.companiesTable.id, companyId),
//     });

//     res.json({ company: companyDetails });
//   }
// );

router.post("/update", authMiddleware, async (req: Request, res: Response) => {
  const user = (req as RequestWithUser).user;
  const projectId = req.body.projectId;
  const projectName = req.body.projectName;

  const project = await db
    .update(schema.projects)
    .set({
      projectName: projectName,
    })
    .where(eq(schema.projects.id, projectId));
});

router.post("/delete", authMiddleware, async (req: Request, res: Response) => {
  const user = (req as RequestWithUser).user;
  const projectId = req.body.projectId;

  const project = await db
    .delete(schema.projects)
    .where(eq(schema.projects.id, projectId));
});

router.post(
  "/select/:projectId",
  authMiddleware,
  async (req: Request, res: Response) => {
    const user = (req as RequestWithUser).user;
    const projectId = req.params.projectId;

    const userToProject = await db.query.userToProject.findFirst({
      where: and(
        eq(schema.userToProject.userId, user.id),
        eq(schema.userToProject.projectId, projectId)
      ),
    });

    if (!userToProject) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.id, projectId),
    });

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    await db
      .update(schema.users)
      .set({
        projectSelectedId: projectId,
      })
      .where(eq(schema.users.id, user.id));

    const company = await db.query.projectToCompanyTable.findFirst({
      where: eq(schema.projectToCompanyTable.projectId, projectId),
      with: {
        company: true,
      },
    });

    res.json({ project: project, company: company });
  }
);

router.get("/list", authMiddleware, async (req: Request, res: Response) => {
  const user = (req as RequestWithUser).user;

  const projects = await db.query.userToProject.findMany({
    where: eq(schema.userToProject.userId, user.id),
    with: {
      project: true,
    },
  });

  const projectsWithCompany = [];

  //Find company for each project
  for (const project of projects) {
    console.log("project", project);
    if (!project.projectId) {
      continue;
    }

    const company = await db.query.projectToCompanyTable.findFirst({
      where: eq(schema.projectToCompanyTable.projectId, project.projectId),
      with: {
        company: true,
      },
    });

    const promptCountResult = await db
      .select({ count: count() })
      .from(schema.promptsTable)
      .where(eq(schema.promptsTable.projectId, project.projectId));

    const promptCount = promptCountResult[0]?.count || 0;

    projectsWithCompany.push({
      ...project,
      company: company?.company,
      promptCount: promptCount,
    });
  }

  res.json(projectsWithCompany);
});

export default router;
